"use strict";
const { Service, ServiceBroker } = require("moleculer");
const TestMixin = require("../../../mixins/testschema.mixin");

describe("Test schema mixin", () => {
	const broker = new ServiceBroker({ logger: true });

	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	it("should have schema properties", async () => {
		const schema = TestMixin;

		expect(schema.name).toEqual("mixin");
		expect(schema.actions).toBeDefined();
		expect(schema.actions.hello).toBeInstanceOf(Function);
	});

	it("should be usable as a mixin", async () => {
		class MyService extends Service {
			constructor(broker) {
				super(broker);

				this.parseServiceSchema({
					name: "test",
					mixins: [TestMixin]
				});
			}
		}

		broker.createService(MyService);
		await broker.waitForServices("test");
		const result = await broker.call("test.hello");

		expect(result).toEqual("hi");

		// cleanup
		broker.destroyService("test");
	});

	it("should not cause JS heap to run out of memory", async () => {
		class MyService extends Service {
			constructor(broker, name) {
				super(broker);

				this.parseServiceSchema({
					name,
					mixins: [TestMixin]
				});
			}
		}

		const max = 100;
		for (let i = 1; i <= max; i++) {
			broker.createService(MyService.bind(null, broker, `test${i}`));
		}

		await broker.waitForServices(`test${max}`);
		const result = await broker.call(`test${max}.hello`);

		expect(result).toEqual("hi");

		// cleanup
		for (let i = 1; i <= max; i++) {
			broker.destroyService(`test${i}`);
		}
	});
});
