// rename-to-kebab-case.js
// Đổi toàn bộ tên file + folder sang kebab-case recursively
//
// Example:
// BudgetStatus.tsx      -> budget-status.tsx
// UserProfileCard       -> user-profile-card
// MyAwesomeDTO.java     -> my-awesome-dto.java
//
// Usage:
// node rename-to-kebab-case.js
// node rename-to-kebab-case.js "D:/your-project"

const fs = require("fs");
const path = require("path");

const ROOT_DIR = process.argv[2] || process.cwd();

function toKebabCase(str) {
    return str
        // ABCDef -> ABC-Def
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")

        // camelCase -> camel-Case
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")

        // snake_case / spaces -> kebab-case
        .replace(/[_\s]+/g, "-")

        .toLowerCase();
}

function renameRecursively(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    // xử lý folder con trước
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            renameRecursively(fullPath);
        }
    }

    // đọc lại vì có thể folder con đã rename
    const updatedEntries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of updatedEntries) {
        const oldPath = path.join(dir, entry.name);

        const parsed = path.parse(entry.name);

        let newName;

        if (entry.isDirectory()) {
            newName = toKebabCase(entry.name);
        } else {
            const kebabBase = toKebabCase(parsed.name);
            newName = `${kebabBase}${parsed.ext}`;
        }

        if (newName !== entry.name) {
            const newPath = path.join(dir, newName);

            fs.renameSync(oldPath, newPath);

            console.log(`Renamed:
${oldPath}
-> ${newPath}
`);
        }
    }
}

try {
    renameRecursively(ROOT_DIR);
    console.log("✅ Done");
} catch (err) {
    console.error("❌ Error:", err);
}