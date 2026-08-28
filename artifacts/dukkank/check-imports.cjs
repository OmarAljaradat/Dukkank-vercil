const fs = require('fs');
const path = require('path');
const ts = require('typescript');

function scanDir(dir) {
    let files = [];
    if (!fs.existsSync(dir)) return files;
    fs.readdirSync(dir).forEach(file => {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
            files = files.concat(scanDir(full));
        } else if (full.endsWith('.jsx') || full.endsWith('.tsx') || full.endsWith('.js') || full.endsWith('.ts')) {
            files.push(full);
        }
    });
    return files;
}

const srcDir = path.join(__dirname, 'src');
const allFiles = scanDir(srcDir);

console.log(`🔍 [AST SCAN] Scanning ${allFiles.length} files for undefined identifiers and missing imports...`);

// 1. Check Lucide Icons
const allLucideIcons = [
    'User', 'Mail', 'Phone', 'Lock', 'LogIn', 'UserPlus', 'ShieldCheck', 'Gamepad2',
    'Home', 'CheckCircle2', 'KeyRound', 'RotateCw', 'AlertCircle', 'Eye', 'EyeOff',
    'Loader2', 'ArrowRight', 'ArrowLeft', 'Shield', 'RefreshCw', 'AlertTriangle', 'Instagram', 'Plus',
    'Trash2', 'Minus', 'Tag', 'Sparkles', 'Gift', 'Zap', 'TrendingUp', 'HeartHandshake',
    'ShoppingBag', 'Heart', 'LogOut', 'BookOpen', 'Wallet', 'CreditCard', 'Star',
    'Clock', 'Calendar', 'Laptop', 'Smartphone', 'Search', 'Filter', 'X', 'Check',
    'MessageCircle', 'FileText', 'Truck', 'Info', 'Hash', 'Twitter', 'ChevronDown',
    'ChevronUp', 'ChevronLeft', 'ChevronRight', 'Copy', 'ExternalLink', 'Send',
    'Flame', 'Trophy', 'Activity', 'Award', 'HelpCircle', 'Headphones', 'Sliders',
    'Layers', 'Grid', 'Package', 'ArrowUpRight', 'ArrowDownLeft', 'DollarSign',
    'Percent', 'Save', 'Pencil', 'PlusCircle', 'Ticket', 'Download', 'Share2',
    'Moon', 'Sun', 'Globe', 'Bell', 'SlidersHorizontal', 'Maximize2', 'Minimize2', 'BadgeCheck'
];

let totalErrors = 0;

allFiles.forEach(file => {
    const code = fs.readFileSync(file, 'utf8');
    
    allLucideIcons.forEach(icon => {
        const jsxRegex = new RegExp('<' + icon + '(\\s|\\/|>)');
        const propRegex = new RegExp('(icon|Icon):\\s*' + icon + '\\b');
        const iconPropRegex = new RegExp('icon=\\{' + icon + '\\}');
        
        const isUsed = jsxRegex.test(code) || propRegex.test(code) || iconPropRegex.test(code);
        
        if (isUsed) {
            const isImported = new RegExp('\\b' + icon + '\\b.*from\\s+["\'].*["\']').test(code) ||
                               new RegExp('import\\s*\\{[^}]*\\b' + icon + '\\b[^}]*\\}').test(code) ||
                               new RegExp('(const|let|var|function)\\s+' + icon + '\\b').test(code);
            
            if (!isImported) {
                console.error(`❌ [IMPORT ERROR] In file "${file}": Lucide icon "${icon}" is used but NOT IMPORTED!`);
                totalErrors++;
            }
        }
    });
});

// 2. Deep TypeScript AST Scope Check
const options = {
    allowJs: true,
    checkJs: true,
    jsx: ts.JsxEmit.ReactJSX,
    noEmit: true,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
};

const program = ts.createProgram(allFiles, options);
const diagnostics = ts.getPreEmitDiagnostics(program);

const knownGlobals = [
    'window', 'document', 'fetch', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
    'localStorage', 'sessionStorage', 'console', 'alert', 'confirm', 'prompt', 'navigator',
    'location', 'history', 'URL', 'URLSearchParams', 'FormData', 'Blob', 'File', 'FileReader',
    'Image', 'Audio', 'Event', 'CustomEvent', 'KeyboardEvent', 'MouseEvent', 'HTMLElement',
    'HTMLInputElement', 'HTMLTextAreaElement', 'HTMLButtonElement', 'HTMLDivElement',
    'performance', 'caches', 'crypto', 'Math', 'JSON', 'Date', 'Promise', 'Array', 'Object',
    'String', 'Number', 'Boolean', 'RegExp', 'Map', 'Set', 'WeakMap', 'WeakSet', 'Error',
    'process', 'Buffer', 'global', 'NodeJS', 'React', 'JSX'
];

diagnostics.forEach(diag => {
    if (diag.code === 2304 || diag.code === 2552) {
        const msg = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
        const file = diag.file ? diag.file.fileName : 'unknown';
        const { line, character } = diag.file ? diag.file.getLineAndCharacterOfPosition(diag.start) : { line: 0, character: 0 };
        
        const match = msg.match(/Cannot find name '([^']+)'/);
        const name = match ? match[1] : '';
        
        if (name && !knownGlobals.includes(name)) {
            console.error(`❌ [SCOPE ERROR] ${file}:${line + 1}:${character + 1} - ${msg}`);
            totalErrors++;
        }
    }
});

if (totalErrors > 0) {
    console.error(`\n🚨 Pre-build check FAILED with ${totalErrors} errors! Build aborted.`);
    process.exit(1);
} else {
    console.log(`✅ [100% CLEAN] Pre-build check PASSED! (0 errors across ${allFiles.length} files)\n`);
}
