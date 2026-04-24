const homeAssistantUrl = (process.env.HOME_ASSISTANT_URL ?? process.env.HA_URL ?? '').replace(/\/$/, '');
const homeAssistantToken = process.env.HOME_ASSISTANT_TOKEN ?? process.env.HA_TOKEN ?? '';

export const getHomeAssistantStatus = () => ({
  configured: Boolean(homeAssistantUrl && homeAssistantToken),
  url: homeAssistantUrl || null,
});

const assertConfigured = () => {
  if (!homeAssistantUrl || !homeAssistantToken) {
    const error = new Error('Home Assistant is not configured. Set HOME_ASSISTANT_URL and HOME_ASSISTANT_TOKEN.');
    error.statusCode = 503;
    throw error;
  }
};

export const callShoppingListService = async (service, data = {}) => {
  assertConfigured();

  const response = await fetch(`${homeAssistantUrl}/api/services/shopping_list/${service}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${homeAssistantToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const body = await response.text();
    const error = new Error(`Home Assistant ${service} failed with ${response.status}: ${body}`);
    error.statusCode = 502;
    throw error;
  }

  return response.json();
};

export const pushRecordToHomeAssistant = async (record) => {
  const actions = [];

  for (const item of record.items) {
    const name = item.raw?.trim();
    if (!name) continue;

    await callShoppingListService('add_item', { name });
    actions.push({ service: 'add_item', name });

    if (item.checked) {
      await callShoppingListService('complete_item', { name });
      actions.push({ service: 'complete_item', name });
    }
  }

  await callShoppingListService('sort');
  actions.push({ service: 'sort' });

  return actions;
};
