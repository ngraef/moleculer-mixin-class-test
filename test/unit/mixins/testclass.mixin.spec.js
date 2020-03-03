"use strict";
const { Service, ServiceBroker } = require("moleculer");
const TestMixin = require("../../../mixins/testclass.mixin");

describe("Test class mixin", () => {
	const broker = new ServiceBroker({ logger: true });

	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	it("should have schema properties", async () => {
		const schema = new TestMixin(broker);

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
					mixins: [new TestMixin(this.broker)]
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
					mixins: [new TestMixin(this.broker)]
				});
			}
		}

		const max = 7;
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
