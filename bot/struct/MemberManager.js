// Member manager
const Member = require('./Member');

class MemberManager {
	constructor() {
		this.members = [];
	}

	addMember(memberId) {
		this.members.push(new Member(memberId));
	}

	removeMember(memberId) {
		this.members = this.members.filter(member => member.id !== memberId);
	}

	getMember(id) {
		return this.members.find(member => member.id === id);
	}

	getMembers() {
		return this.members;
	}

	getMemberCount() {
		return this.members.length;
	}

	fromJSON(json) {
		this.members = json.map(member => new Member().fromJSON(member));
	}

	toJSON() {
		return this.members.map(member => member.toJSON());
	}
}

module.exports = MemberManager;