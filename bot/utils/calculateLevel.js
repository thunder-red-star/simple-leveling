const calculateLevel = (xp) => {
	// First level starts at 100 XP
	// Each level is 25 XP higher than the previous level
	// If the level is higher than 100, the XP gain will be capped at the same XP gain needed as the 100th level
	// So the amount of XP needed to reach the next level is:
	// (level * 25) + 100
	let level = 1;
	while (xp >= ((level > 100 ? 100 : level) * 25) + 100) {
		level++;
		xp -= ((level > 100 ? 100 : level) * 25) + 100;
	}
	return level;
}

module.exports = calculateLevel;