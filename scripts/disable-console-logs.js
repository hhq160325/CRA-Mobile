const fs = require('fs');
const path = require('path');


const filesToUpdate = [
    'lib/utils/googleLogin.ts',
    'lib/services/locationService.ts',
    'lib/hooks/useUserLocation.ts',
    'app/screens/verify/verify.screen.tsx',
    'app/screens/staff/vehicle-return.screen.tsx'
];


function addLoggerImport(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');


    if (content.includes("import { logger } from")) {
        return content;
    }


    const lines = content.split('\n');
    let lastImportIndex = -1;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ') || lines[i].trim().startsWith('from ')) {
            lastImportIndex = i;
        }
    }

    if (lastImportIndex !== -1) {

        const relativePath = path.relative(path.dirname(filePath), 'lib/utils/logger.ts')
            .replace(/\\/g, '/')
            .replace(/\.ts$/, '');

        const loggerImport = `import { logger } from '${relativePath.startsWith('.') ? relativePath : './' + relativePath}';`;
        lines.splice(lastImportIndex + 1, 0, loggerImport);
    }

    return lines.join('\n');
}


function replaceConsoleStatements(content) {
    return content
        .replace(/console\.log\(/g, 'logger.log(')
        .replace(/console\.info\(/g, 'logger.info(')
        .replace(/console\.warn\(/g, 'logger.warn(')
        .replace(/console\.error\(/g, 'logger.error(')
        .replace(/console\.debug\(/g, 'logger.debug(');
}

filesToUpdate.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        console.log(`Processing ${filePath}...`);

        let content = fs.readFileSync(filePath, 'utf8');
        content = addLoggerImport(content);
        content = replaceConsoleStatements(content);

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    } else {
        console.log(`File not found: ${filePath}`);
    }
});

console.log('Console log replacement completed!');