"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var socialMediaAPI_1 = require("./services/socialMediaAPI");
// Teste funcional do serviço
function testSocialService() {
    return __awaiter(this, void 0, void 0, function () {
        var result1, result2, result3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🔍 Testando serviço de redes sociais...');
                    // Teste 1: Instagram com keywords
                    console.log('\n📱 Teste 1: @professor_edu');
                    return [4 /*yield*/, socialMediaAPI_1.socialMediaService.analyzeProfile('@professor_edu')];
                case 1:
                    result1 = _a.sent();
                    console.log('Resultado:', {
                        exists: result1.exists,
                        platform: result1.platform,
                        creatorType: result1.creatorType,
                        confidence: result1.confidence,
                        followers: result1.followers
                    });
                    // Teste 2: LinkedIn
                    console.log('\n👔 Teste 2: linkedin.com/in/business-ceo');
                    return [4 /*yield*/, socialMediaAPI_1.socialMediaService.analyzeProfile('linkedin.com/in/business-ceo')];
                case 2:
                    result2 = _a.sent();
                    console.log('Resultado:', {
                        exists: result2.exists,
                        platform: result2.platform,
                        creatorType: result2.creatorType,
                        confidence: result2.confidence,
                        followers: result2.followers
                    });
                    // Teste 3: Perfil que não existe
                    console.log('\n❌ Teste 3: @fake_profile_123');
                    return [4 /*yield*/, socialMediaAPI_1.socialMediaService.analyzeProfile('@fake_profile_123')];
                case 3:
                    result3 = _a.sent();
                    console.log('Resultado:', {
                        exists: result3.exists,
                        platform: result3.platform,
                        confidence: result3.confidence
                    });
                    console.log('\n✅ Testes concluídos!');
                    return [2 /*return*/];
            }
        });
    });
}
testSocialService().catch(console.error);
