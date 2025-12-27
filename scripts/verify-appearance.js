
const fs = require('fs');
const path = require('path');

console.log("Starting static verification of appearance features...");

try {
    // 1. Verify Settings Dialog
    const settingsPath = path.join(process.cwd(), 'src/components/organisms/settings-dialog.tsx');
    const settingsContent = fs.readFileSync(settingsPath, 'utf8');

    if (!settingsContent.includes('activeTab === "appearance"')) throw new Error("Settings dialog missing appearance tab logic");
    if (!settingsContent.includes('Theme Color')) throw new Error("Settings dialog missing Theme Color section");
    if (!settingsContent.includes('Editor Typography')) throw new Error("Settings dialog missing Editor Typography section");
    console.log("✅ Settings Dialog verification passed");

    // 2. Verify Appearance Provider
    const providerPath = path.join(process.cwd(), 'src/components/providers/appearance-provider.tsx');
    const providerContent = fs.readFileSync(providerPath, 'utf8');

    if (!providerContent.includes('createContext')) throw new Error("Provider missing context creation");
    if (!providerContent.includes('THEME_COLORS')) throw new Error("Provider missing theme colors definition");
    if (!providerContent.includes('useAppearance')) throw new Error("Provider missing useAppearance hook");
    console.log("✅ Appearance Provider verification passed");

    // 3. Verify Database Schema (indirectly via file check)
    const schemaPath = path.join(process.cwd(), 'src/lib/db/schema/auth.ts');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');

    if (!schemaContent.includes('appearancePreferences')) throw new Error("Schema missing appearancePreferences column");
    console.log("✅ Database Schema verification passed");

    console.log("🎉 All appearance feature checks passed!");
    process.exit(0);
} catch (error) {
    console.error("❌ Verification failed:", error.message);
    process.exit(1);
}
