const fs = require('fs');
const path = require('path');

function scanDir(dir) {
    let files = [];
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

const allLucideIcons = [
    'User', 'Mail', 'Phone', 'Lock', 'LogIn', 'UserPlus', 'ShieldCheck', 'Gamepad2',
    'Home', 'CheckCircle2', 'KeyRound', 'RotateCw', 'AlertCircle', 'Eye', 'EyeOff',
    'Loader2', 'ArrowRight', 'Shield', 'RefreshCw', 'AlertTriangle', 'Instagram', 'Plus',
    'Trash2', 'Minus', 'Tag', 'Sparkles', 'Gift', 'Zap', 'TrendingUp', 'HeartHandshake',
    'ShoppingBag', 'Heart', 'LogOut', 'BookOpen', 'Wallet', 'CreditCard', 'Star',
    'Clock', 'Calendar', 'Laptop', 'Smartphone', 'Search', 'Filter', 'X', 'Check',
    'MessageCircle', 'FileText', 'Truck', 'Info', 'Hash', 'Twitter', 'ChevronDown',
    'ChevronUp', 'ChevronLeft', 'ChevronRight', 'Copy', 'ExternalLink', 'Send',
    'Flame', 'Trophy', 'Activity', 'Award', 'HelpCircle', 'Headphones', 'Sliders',
    'Layers', 'Grid', 'Package', 'ArrowUpRight', 'ArrowDownLeft', 'DollarSign',
    'Percent', 'Save', 'Pencil', 'PlusCircle', 'Ticket', 'Download', 'Share2',
    'Moon', 'Sun', 'Globe', 'Bell', 'SlidersHorizontal', 'Maximize2', 'Minimize2'
];

const srcDir = 'c:/Users/omarj/OneDrive/Desktop/Dukkank.UP-main/artifacts/dukkank/src';
const allFiles = scanDir(srcDir);

let totalErrors = 0;

allFiles.forEach(file => {
    const code = fs.readFileSync(file, 'utf8');
    
    // Check Lucide icons used in JSX: <IconName or IconName.
    allLucideIcons.forEach(icon => {
        // regex for JSX tag or prop: <IconName or icon={IconName} or icon: IconName
        const jsxRegex = new RegExp('<' + icon + '(\\s|\\/|>)');
        const propRegex = new RegExp('(icon|Icon):\\s*' + icon + '\\b');
        const iconPropRegex = new RegExp('icon=\\{' + icon + '\\}');
        
        const isUsed = jsxRegex.test(code) || propRegex.test(code) || iconPropRegex.test(code);
        
        if (isUsed) {
            // Check if icon is declared or imported
            // 1. In import ... from "lucide-react" or from any path
            // 2. Or defined as const Icon = ... / function Icon ...
            const isImported = new RegExp('\\b' + icon + '\\b.*from\\s+["\'].*["\']').test(code) ||
                               new RegExp('import\\s*\\{[^}]*\\b' + icon + '\\b[^}]*\\}').test(code) ||
                               new RegExp('(const|let|var|function)\\s+' + icon + '\\b').test(code);
            
            if (!isImported) {
                console.error(`ERROR: In file "${file}": Lucide icon "${icon}" is used but NOT IMPORTED!`);
                totalErrors++;
            }
        }
    });
});

console.log(`\nScan complete. Total missing import errors found: ${totalErrors}`);
