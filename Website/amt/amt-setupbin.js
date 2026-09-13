/*
Copyright 2020-2021 Intel Corporation

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * @description Intel(R) AMT Setup.bin Parser
 * @author Ylian Saint-Hilaire
 * @version v0.1.0
 */

var CreateAmtSetupBinStack = function () {
    var o = {};

    // Intel(R) AMT Setup.bin GUID's
    var AmtSetupBinSetupGuids = [
        '\xb5\x16\xfb\x71\x87\xcb\xf9\x4a\xb4\x41\xca\x7b\x38\x35\x78\xf9',
        '\x96\xb2\x81\x58\xcf\x6b\x72\x4c\x8b\x91\xa1\x5e\x51\x2e\x99\xc4',
        '\xa7\xf7\xf6\xc6\x89\xc4\xf6\x47\x93\xed\xe2\xe5\x02\x0d\xa5\x1d',
        '\xaa\xa9\x34\x52\xe1\x29\xa9\x44\x8d\x4d\x08\x1c\x07\xb9\x63\x53'
    ];

    // Notes about version 2 of setup.bin:
    //   - Default "admin" must be followed by a new MEBx password
    //   - ME_VARIABLE_IDENTIFIER_MANAGEABILITY_FEATURE_SELECTION may not appear after any CM settings
    //   - CM_VARIABLE_IDENTIFIER_USER_DEFINED_CERT_ADD must be preceded by setting CM_VARIABLE_IDENTIFIER_USER_DEFINED_CERTS_CONFIG to (TODO!)

    // General notes:
    //   - Setup.bin should always start with "CurrentMEBx Pwd", "newMebx Pwd", "manageability selection" (if present).

    // Intel(R) AMT variable identifiers
    // Type: 0 = Binary String, 1 = Char, 2 = Short, 3 = Int
    var AmtSetupBinVarIds = {
        1: {
            1: [0, "Current MEBx Password"],
            2: [0, "New MEBx Password"],
            3: [1, "Manageability Feature Selection",
                { 0: "None", 1: "Intel AMT" }],
            4: [1, "Firmware Local Update",
                { 0: "Disabled", 1: "Enabled", 2: "Password Protected" }],
            5: [1, "Firmware Update Qualifier",
                { 0: "Always", 1: "Never", 2: "Restricted" }],
            6: [4, "Power Package"]
        },

        2: {
            1: [0, "Provisioning Preshared Key ID (PID)"],
            2: [0, "Provisioning Preshared Key (PPS)"],
            3: [0, "PKI DNS Suffix"],
            4: [0, "Configuration Server FQDN"],
            5: [1, "Remote Configuration Enabled (RCFG)",
                { 0: "Off", 1: "On" }],
            6: [1, "Pre-Installed Certificates Enabled",
                { 0: "Off", 1: "On" }],
            7: [1, "User Defined Certificate Configuration",
                { 0: "Disabled", 1: "Enabled", 2: "Delete" }],
            8: [0, "User Defined Certificate Addition"],

            10: [1, "SOL/IDER Redirection Configuration", {
                0: "None",
                1: "SOL only - User/Pass Disabled",
                2: "IDER only - User/Pass Disabled",
                3: "SOL+IDER - User/Pass Disabled",
                4: "None - User/Pass Enabled",
                5: "SOL only - User/Pass Enabled",
                6: "IDER only - User/Pass Enabled",
                7: "SOL+IDER - User/Pass Enabled"
            }],

            11: [0, "Hostname"],
            12: [0, "Domain Name"],
            13: [1, "DHCP",
                { 1: "Disabled", 2: "Enabled" }],
            14: [1, "Secure Firmware Update (SFWU)",
                { 0: "Disabled", 1: "Enabled" }],
            15: [0, "ITO"],
            16: [1, "Provisioning Mode (PM)",
                { 0: "Enterprise", 1: "Small Buisness" }],
            17: [0, "Provisioning Server Address"],
            18: [2, "Provision Server Port Number (PSPO)"],
            19: [0, "Static IPv4 Parameters"],
            20: [0, "VLAN"],
            21: [0, "PASS Policy Flag"],
            22: [0, "IPv6"],
            23: [1, "Shared/Dedicated FQDN",
                { 0: "Dedicated", 1: "Shared" }],
            24: [1, "Dynamic DNS Update",
                { 0: "Disabled", 1: "Enabled" }],
            25: [1, "Remote Desktop (KVM) State",
                { 0: "Disabled", 1: "Enabled" }],
            26: [1, "Opt-in User Consent Option",
                { 0: "Disabled", 1: "KVM", 255: "All" }],
            27: [1, "Opt-in Remote IT Consent Policy",
                { 0: "Disabled", 1: "Enabled" }],
            28: [1, "ME Provision Halt/Active",
                { 0: "Stop", 1: "Start" }],
            29: [1, "Manual Setup and Configuration",
                { 0: "Automated", 1: "Manual" }],
            30: [3, "Support Channel Identifier"],
            31: [0, "Support Channel Description"],
            32: [0, "Service Account Number"],
            33: [0, "Enrollement Passcode"],
            34: [3, "Service Type"],
            35: [0, "Service Provider Identifier"]
        }
    };

    // Create a Setup.bin object
    o.AmtSetupBinCreate = function (version, flags) {
        var obj = {};

        obj.fileType = version;
        obj.recordChunkCount = 1;
        obj.recordHeaderByteCount = 46;
        obj.recordNumber = 0;
        obj.majorVersion = version;
        obj.minorVersion = 0;
        obj.flags = flags;
        obj.dataRecordsConsumed = 0;
        obj.dataRecordChunkCount = 1;
        obj.records = [];

        return obj;
    };

    // Parse the Setup.bin file
    o.AmtSetupBinDecode = function (file) {

        if (typeof file !== 'string') {
            return null;
        }

        if (file.length < 512) {
            return null;
        }

        var obj = {};
        var UUID = file.substring(0, 16);

        obj.fileType = 0;

        for (var i in AmtSetupBinSetupGuids) {
            if (UUID === AmtSetupBinSetupGuids[i]) {
                obj.fileType = (+i + 1);
                break;
            }
        }

        if (obj.fileType === 0) {
            return null;
        }

        obj.recordChunkCount = ReadShortX(file, 16);
        obj.recordHeaderByteCount = ReadShortX(file, 18);
        obj.recordNumber = ReadIntX(file, 20);
        obj.majorVersion = file.charCodeAt(24);
        obj.minorVersion = file.charCodeAt(25);
        obj.flags = ReadShortX(file, 26);

        var dataRecordCount = ReadIntX(file, 28);

        obj.dataRecordsConsumed = ReadIntX(file, 32);
        obj.dataRecordChunkCount = ReadShortX(file, 36);
        obj.records = [];

        var ptr = 512;

        while (ptr + 512 <= file.length) {

            var r = {};

            r.typeIdentifier = ReadIntX(file, ptr);
            r.flags = ReadIntX(file, ptr + 4);
            r.chunkCount = ReadShortX(file, ptr + 8);
            r.headerByteCount = ReadShortX(file, ptr + 10);
            r.number = ReadIntX(file, ptr + 12);
            r.variables = [];

            var ptr2 = 0;
            var recbin = file.substring(ptr + 24, ptr + 512);

            if ((r.flags & 2) !== 0) {
                recbin = AmtSetupBinDescrambleRecordData(recbin);
            }

            while (ptr2 + 8 <= recbin.length) {

                var v = {};

                v.moduleid = ReadShortX(recbin, ptr2);
                v.varid = ReadShortX(recbin, ptr2 + 2);

                if (v.moduleid === 0 || v.varid === 0) {
                    break;
                }

                if (
                    AmtSetupBinVarIds[v.moduleid] &&
                    AmtSetupBinVarIds[v.moduleid][v.varid]
                ) {
                    v.length = ReadShortX(recbin, ptr2 + 4);
                    v.type = AmtSetupBinVarIds[v.moduleid][v.varid][0];
                    v.desc = AmtSetupBinVarIds[v.moduleid][v.varid][1];

                    if (ptr2 + 8 + v.length > recbin.length) {
                        break;
                    }

                    v.value = recbin.substring(
                        ptr2 + 8,
                        ptr2 + 8 + v.length
                    );

                    if (v.type === 1 && v.length === 1) {
                        v.value = v.value.charCodeAt(0);
                    } else if (v.type === 2 && v.length === 2) {
                        v.value = ReadShortX(v.value, 0);
                    } else if (v.type === 3 && v.length === 4) {
                        v.value = ReadIntX(v.value, 0);
                    } else if (v.type === 4) {
                        v.value = guidToStr(rstr2hex(v.value));
                    }

                    r.variables.push(v);
                }

                ptr2 += 8 + (Math.floor((v.length + 3) / 4) * 4);

                if (ptr2 > recbin.length) {
                    break;
                }
            }

            r.variables.sort(AmtSetupBinVariableCompare);
            obj.records.push(r);

            ptr += 512;
        }

        if (dataRecordCount !== obj.records.length) {
            return null;
        }

        return obj;
    };

    // Construct a Setup.bin file
    o.AmtSetupBinEncode = function (obj) {

        if (!obj || typeof obj !== 'object') {
            return null;
        }

        // FIXED:
        // The original condition used &&, which could never be true.
        if (
            obj.fileType < 1 ||
            obj.fileType > AmtSetupBinSetupGuids.length
        ) {
            return null;
        }

        var out = [];
        var r = AmtSetupBinSetupGuids[obj.fileType - 1];
        var reccount = 0;

        // Get the list of modules used
        var modulesInUse = [];

        for (var i in obj.records) {
            var rec = obj.records[i];

            for (var j in rec.variables) {
                var v = rec.variables[j];

                if (modulesInUse.indexOf(v.moduleid) === -1) {
                    modulesInUse.push(v.moduleid);
                }
            }
        }

        r += ShortToStrX(obj.recordChunkCount);
        r += ShortToStrX(42 + (modulesInUse.length * 2));
        r += IntToStrX(obj.recordNumber);
        r += String.fromCharCode(
            obj.majorVersion,
            obj.minorVersion
        );
        r += ShortToStrX(obj.flags);
        r += IntToStrX(obj.records.length);
        r += IntToStrX(obj.dataRecordsConsumed);
        r += ShortToStrX(obj.dataRecordChunkCount);
        r += ShortToStrX(0);

        for (var k in modulesInUse) {
            r += ShortToStrX(modulesInUse[k]);
        }

        while (r.length < 512) {
            r += '\0';
        }

        out.push(r);

        // Write each record
        for (var x in obj.records) {

            var r2 = '';
            var rec = obj.records[x];

            r2 += IntToStrX(rec.typeIdentifier);
            r2 += IntToStrX(rec.flags);
            r2 += IntToStrX(0);
            r2 += IntToStrX(0);
            r2 += ShortToStrX(1);
            r2 += ShortToStrX(24);
            r2 += IntToStrX(++reccount);

            // Sort the variables
            rec.variables.sort(AmtSetupBinVariableCompare);

            // Write each variable
            for (var y in rec.variables) {

                var r3 = '';
                var v = rec.variables[y];
                var data = v.value;

                if (
                    !AmtSetupBinVarIds[v.moduleid] ||
                    !AmtSetupBinVarIds[v.moduleid][v.varid]
                ) {
                    continue;
                }

                v.type =
                    AmtSetupBinVarIds[v.moduleid][v.varid][0];

                if ((v.type > 0) && (v.type < 4)) {

                    data = parseInt(data, 10);

                    if (v.type === 1) {
                        data = String.fromCharCode(data);
                    }

                    if (v.type === 2) {
                        data = ShortToStrX(data);
                    }

                    if (v.type === 3) {
                        data = IntToStrX(data);
                    }
                }

                if (v.type === 4) {
                    data = hex2rstr(
                        guidToStr(
                            data.split('-').join('')
                        ).split('-').join('')
                    );
                }

                r3 += ShortToStrX(v.moduleid);
                r3 += ShortToStrX(v.varid);
                r3 += ShortToStrX(data.length);
                r3 += ShortToStrX(0);
                r3 += data;

                while (r3.length % 4 !== 0) {
                    r3 += '\0';
                }

                r2 += r3;
            }

            while (r2.length < 512) {
                r2 += '\0';
            }

            if ((rec.flags & 2) !== 0) {
                r2 =
                    r2.substring(0, 24) +
                    AmtSetupBinScrambleRecordData(
                        r2.substring(24)
                    );
            }

            out.push(r2);
        }

        return out.join('');
    };

    // Used to sort variables
    function AmtSetupBinVariableCompare(a, b) {

        if (a.moduleid > b.moduleid) {
            return 1;
        }

        if (a.moduleid < b.moduleid) {
            return -1;
        }

        if (a.varid > b.varid) {
            return 1;
        }

        if (a.varid < b.varid) {
            return -1;
        }

        return 0;
    }

    // Scramble and un-scramble records
    function AmtSetupBinScrambleRecordData(data) {

        var out = '';

        for (var i = 0; i < data.length; i++) {
            out += String.fromCharCode(
                (data.charCodeAt(i) + 17) & 0xFF
            );
        }

        return out;
    }

    function AmtSetupBinDescrambleRecordData(data) {

        var out = '';

        for (var i = 0; i < data.length; i++) {
            out += String.fromCharCode(
                (data.charCodeAt(i) + 0xEF) & 0xFF
            );
        }

        return out;
    }

    function ShortToStrX(v) {
        return String.fromCharCode(
            v & 0xFF,
            (v >> 8) & 0xFF
        );
    }

    function IntToStrX(v) {
        return String.fromCharCode(
            v & 0xFF,
            (v >> 8) & 0xFF,
            (v >> 16) & 0xFF,
            (v >> 24) & 0xFF
        );
    }

    function ReadShortX(v, p) {
        return (
            (v.charCodeAt(p + 1) << 8) +
            v.charCodeAt(p)
        );
    }

    function ReadIntX(v, p) {
        return (
            (v.charCodeAt(p + 3) * 0x1000000) +
            (v.charCodeAt(p + 2) << 16) +
            (v.charCodeAt(p + 1) << 8) +
            v.charCodeAt(p)
        );
    }

    return o;
};

module.exports = CreateAmtSetupBinStack;