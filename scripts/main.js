import { world, ItemStack, Items } from "@minecraft/server";

world.afterEvents.playerBreakBlock.subscribe((event) => {
    const { block, player, itemStackAfterBreak } = event;
    if (!itemStackAfterBreak || !itemStackAfterBreak.typeId.includes("pickaxe")) return;

    // Check for enchantments
    let fortuneLevel = 0, hasSilkTouch = false;
    const enchantComponent = itemStackAfterBreak.getComponent("minecraft:enchantments");
    if (enchantComponent) {
        const enchantments = enchantComponent.enchantments;
        const fortune = enchantments.getEnchantment("fortune");
        const silkTouch = enchantments.getEnchantment("silk_touch");
        
        if (fortune) fortuneLevel = fortune.level;
        if (silkTouch && silkTouch.level > 0) hasSilkTouch = true;
    }

    // If Silk Touch is present, stop processing (drop the block normally)
    if (hasSilkTouch) return;

    let smeltedItem, baseDrop = 1;
    switch (block.typeId) {
        case "minecraft:iron_ore":
        case "minecraft:deepslate_iron_ore":
            smeltedItem = Items.get("minecraft:iron_ingot");
            break;
        case "minecraft:gold_ore":
        case "minecraft:deepslate_gold_ore":
            smeltedItem = Items.get("minecraft:gold_ingot");
            break;
        case "minecraft:copper_ore":
        case "minecraft:deepslate_copper_ore":
            smeltedItem = Items.get("minecraft:copper_ingot");
            baseDrop = Math.floor(Math.random() * 3) + 1; // Copper normally drops 2-5 raw
            break;
        default:
            return;
    }

    // Apply Fortune multiplier
    let fortuneMultiplier = 1;
    if (fortuneLevel > 0) {
        fortuneMultiplier += Math.floor(Math.random() * (fortuneLevel + 1));
    }

    // Calculate final drop count
    const totalDrop = baseDrop * fortuneMultiplier;
    const itemStack = new ItemStack(smeltedItem, totalDrop);
    
    // Spawn smelted item and give XP
    block.dimension.spawnItem(itemStack, block.location);
    block.dimension.runCommand(`xp ${totalDrop}L ${player.name}`);
});
