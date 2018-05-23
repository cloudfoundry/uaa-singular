module.exports = {
  getMajor: function(version) {
    return parseInt(version.split(".")[0]);
  },

  getMinor: function (version) {
    return parseInt(version.split(".")[1]);
  },

  getPatch: function (version) {
    return parseInt(version.split("-")[0].split(".")[2]);
  },

  isGreaterThanOrEqualTo: function(versionA, versionB) {
    var majA = this.getMajor(versionA);
    var minA = this.getMinor(versionA);
    var patchA = this.getPatch(versionA);
    var majB = this.getMajor(versionB);
    var minB = this.getMinor(versionB);
    var patchB = this.getPatch(versionB);

    if (majA > majB) {
      return true;
    }

    if ((majA === majB) && (minA > minB)) {
      return true;
    }

    if ((majA === majB) && (minA === minB) && (patchA > patchB)) {
      return true;
    }

    if ((majA === majB) && (minA === minB) && (patchA === patchB)) {
      return true;
    }

    return false;
  }
};
