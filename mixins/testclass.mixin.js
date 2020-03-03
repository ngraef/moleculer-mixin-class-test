const { Service } = require("moleculer");

class TestMixin extends Service {
	constructor(broker) {
		super(broker);

		this.parseServiceSchema({
			name: "mixin",
			actions: {
				hello: this.hello
			}
		});
	}

	hello() {
		return "hi";
	}
}

module.exports = TestMixin;
