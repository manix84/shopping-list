import { copyFile } from 'node:fs/promises';
import { join } from 'node:path';

const distPath = join(process.cwd(), 'dist');

await copyFile(join(distPath, 'index.html'), join(distPath, '404.html'));
