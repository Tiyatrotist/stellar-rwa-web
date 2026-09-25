import { Networks, scValToNative } from "@stellar/stellar-sdk";
import {
  arg,
  explorerAccountUrl,
  explorerContractUrl,
  explorerTxUrl,
  networkPassphrase,
} from "@/lib/stellar";

describe("stellar helpers", () => {
  describe("explorer URLs", () => {
    it.each([
      ["testnet", "https://stellar.expert/explorer/testnet"],
      ["mainnet", "https://stellar.expert/explorer/public"],
    ] as const)("builds explorer links for %s", (network, base) => {
      expect(explorerContractUrl(network, "CABC")).toBe(`${base}/contract/CABC`);
      expect(explorerTxUrl(network, "deadbeef")).toBe(`${base}/tx/deadbeef`);
      expect(explorerAccountUrl(network, "GABC")).toBe(`${base}/account/GABC`);
    });
  });

  it("returns the SDK passphrase for each supported network", () => {
    expect(networkPassphrase("testnet")).toBe(Networks.TESTNET);
    expect(networkPassphrase("mainnet")).toBe(Networks.PUBLIC);
  });

  describe("argument builders", () => {
    const ACCOUNT = "GAIQGTOBTTLLDJ4SWGGESM7UWJ2DI4K3ZNHUSHPDKJL2IE5FKY3BSRAA";

    it("encodes address and string-like values", () => {
      expect(scValToNative(arg.address(ACCOUNT))).toBe(ACCOUNT);
      expect(scValToNative(arg.string("hello"))).toBe("hello");
      expect(scValToNative(arg.symbol("ready"))).toBe("ready");
    });

    it("encodes boolean and integer values with the expected native types", () => {
      expect(scValToNative(arg.bool(true))).toBe(true);
      expect(scValToNative(arg.u32(42))).toBe(42);
      expect(scValToNative(arg.u64(42))).toBe(42n);
      expect(scValToNative(arg.i128(-42n))).toBe(-42n);
    });
  });
});
