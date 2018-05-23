const VersionUtils = require('../../src/versionUtils');

describe("VersionUtils", function () {
  describe("getMajor", function() {
    it("understands SNAPSHOT versions", function() {
      expect(VersionUtils.getMajor("12.5.4-SNAPSHOT")).toEqual(12);
    });

    it("understands non-SNAPSHOT versions", function() {
      expect(VersionUtils.getMajor("1.5.4")).toEqual(1);
      expect(VersionUtils.getMajor("2.5.4")).toEqual(2);
    });
  });

  describe("getMinor", function() {
    it("understands SNAPSHOT versions", function() {
      expect(VersionUtils.getMinor("1.2.4-SNAPSHOT")).toEqual(2);
    });

    it("understands non-SNAPSHOT versions", function() {
      expect(VersionUtils.getMinor("1.5.4")).toEqual(5);
      expect(VersionUtils.getMinor("2.5.4")).toEqual(5);
    });
  });

  describe("getPatch", function() {
    it("understands SNAPSHOT versions", function() {
      expect(VersionUtils.getPatch("1.2.4-SNAPSHOT")).toEqual(4);
    });

    it("understands non-SNAPSHOT versions", function() {
      expect(VersionUtils.getPatch("1.5.4")).toEqual(4);
      expect(VersionUtils.getPatch("2.5.45")).toEqual(45);
    });
  });

  describe("isGreaterThanOrEqualTo", function() {
    it("understands SNAPSHOT versions", function() {
      expect(VersionUtils.isGreaterThanOrEqualTo("1.5.4", "1.5.4")).toBeTruthy();
      expect(VersionUtils.isGreaterThanOrEqualTo("1.5.5", "1.5.4")).toBeTruthy();
      expect(VersionUtils.isGreaterThanOrEqualTo("1.6.4", "1.5.4")).toBeTruthy();
      expect(VersionUtils.isGreaterThanOrEqualTo("2.5.4", "1.5.4")).toBeTruthy();
      expect(VersionUtils.isGreaterThanOrEqualTo("1.5.4", "1.5.5")).toBeFalsy();
      expect(VersionUtils.isGreaterThanOrEqualTo("1.5.4", "1.6.4")).toBeFalsy();
      expect(VersionUtils.isGreaterThanOrEqualTo("1.5.4", "2.5.4")).toBeFalsy();
    });

    it("understands non-SNAPSHOT versions", function() {
      expect(VersionUtils.isGreaterThanOrEqualTo("1.5.4-SNAPSHOT", "1.5.4-SNAPSHOT")).toBeTruthy();
      expect(VersionUtils.isGreaterThanOrEqualTo("1.5.5-SNAPSHOT", "1.5.4-SNAPSHOT")).toBeTruthy();
      expect(VersionUtils.isGreaterThanOrEqualTo("1.6.4-SNAPSHOT", "1.5.4-SNAPSHOT")).toBeTruthy();
      expect(VersionUtils.isGreaterThanOrEqualTo("2.5.4-SNAPSHOT", "1.5.4-SNAPSHOT")).toBeTruthy();
      expect(VersionUtils.isGreaterThanOrEqualTo("1.5.4-SNAPSHOT", "1.5.5-SNAPSHOT")).toBeFalsy();
      expect(VersionUtils.isGreaterThanOrEqualTo("1.5.4-SNAPSHOT", "1.6.4-SNAPSHOT")).toBeFalsy();
      expect(VersionUtils.isGreaterThanOrEqualTo("1.5.4-SNAPSHOT", "2.5.4-SNAPSHOT")).toBeFalsy();
    });
  });
});