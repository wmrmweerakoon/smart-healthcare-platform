const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const outputFile = path.join(rootDir, 'APPENDIX_SOURCE_CODE.txt');
const searchPaths = [
    path.join(rootDir, 'services'),
    path.join(rootDir, 'client', 'src')
];

let content = '========== PROJECT SOURCE CODE APPENDIX (SE-128) ==========\n\n';

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
                walkDir(fullPath);
            }
        } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.css')) {
            const relativePath = path.relative(rootDir, fullPath);
            content += `\n\n--------------------------------------------------\n`;
            content += `FILE: ${relativePath}\n`;
            content += `--------------------------------------------------\n\n`;
            content += fs.readFileSync(fullPath, 'utf8');
            content += '\n';
        }
    }
}

searchPaths.forEach(p => {
    if (fs.existsSync(p)) {
        walkDir(p);
    }
});

fs.writeFileSync(outputFile, content);
console.log(`✅ Success! All code aggregated into APPENDIX_SOURCE_CODE.txt`);
