class Member {
	constructor (id = "") {
		this.id = id;
		this.xp = 0;
		this.xpBanned = false;
		this.lastCheckedLevel = 0;
	}

	addXP (xp) {
		this.xp += xp;
	}

	setXPBanned (xpBanned) {
		this.xpBanned = xpBanned;
	}

	getId () {
		return this.id;
	}

	getXP () {
		return this.xp;
	}

	getXPBanned () {
		return this.xpBanned;
	}

	fromJSON (json) {
		this.xp = json.xp;
		this.xpBanned = json.xpBanned;
		this.id = json.id;
		this.lastCheckedLevel = json.lastCheckedLevel;
		return this;
	}

	toJSON () {
		return {
			xp: this.xp,
			xpBanned: this.xpBanned,
			id: this.id,
			lastCheckedLevel: this.lastCheckedLevel
		};
	}
}

module.exports = Member;