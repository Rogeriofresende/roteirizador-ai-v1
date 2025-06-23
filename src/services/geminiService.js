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
exports.refineText = exports.geminiService = exports.GeminiService = void 0;
var GeminiService = /** @class */ (function () {
    function GeminiService() {
        this.apiKey = null;
        this.model = null;
        this.initializeFromStorage();
    }
    GeminiService.prototype.initializeFromStorage = function () {
        try {
            // APENAS carregar da variável de ambiente ou localStorage
            var envKey = import.meta.env.VITE_GEMINI_API_KEY;
            var storedKey = localStorage.getItem('GEMINI_API_KEY');
            // Prioridade: localStorage > env
            var apiKey = storedKey || envKey;
            if (apiKey) {
                this.apiKey = apiKey;
                this.initializeModel();
            }
        }
        catch (error) {
            console.warn('Failed to initialize from storage:', error);
        }
    };
    GeminiService.prototype.initializeModel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var GoogleGenerativeAI_1, genAI, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!this.apiKey)
                            return [2 /*return*/];
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('@google/generative-ai'); })];
                    case 1:
                        GoogleGenerativeAI_1 = (_a.sent()).GoogleGenerativeAI;
                        genAI = new GoogleGenerativeAI_1(this.apiKey);
                        this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                        console.log('✅ Gemini API configurada com sucesso');
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('❌ Erro ao inicializar Gemini:', error_1);
                        this.model = null;
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    GeminiService.prototype.setApiKey = function (apiKey) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.apiKey = apiKey;
                        localStorage.setItem('GEMINI_API_KEY', apiKey);
                        return [4 /*yield*/, this.initializeModel()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.model !== null];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Failed to set API key:', error_2);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    GeminiService.prototype.isConfigured = function () {
        return this.apiKey !== null && this.model !== null;
    };
    GeminiService.prototype.generateScript = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var prompt_1, result, response, text, error_3;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 3, , 4]);
                        console.log('🚀 Iniciando geração de roteiro...', params);
                        if (!this.isConfigured()) {
                            throw new Error('Gemini API não configurado. Configure sua API key primeiro.');
                        }
                        prompt_1 = this.buildPrompt(params);
                        console.log('📝 Prompt criado, enviando para Gemini...');
                        return [4 /*yield*/, this.model.generateContent(prompt_1)];
                    case 1:
                        result = _e.sent();
                        return [4 /*yield*/, result.response];
                    case 2:
                        response = _e.sent();
                        text = response.text();
                        console.log('✅ Roteiro gerado com sucesso!');
                        return [2 /*return*/, text];
                    case 3:
                        error_3 = _e.sent();
                        console.error('❌ Erro detalhado ao gerar roteiro:', error_3);
                        // Mensagens de erro mais específicas
                        if ((_a = error_3.message) === null || _a === void 0 ? void 0 : _a.includes('API_KEY_INVALID')) {
                            throw new Error('API key inválida. Verifique sua chave do Google AI Studio.');
                        }
                        if ((_b = error_3.message) === null || _b === void 0 ? void 0 : _b.includes('QUOTA_EXCEEDED')) {
                            throw new Error('Limite de uso da API atingido. Tente novamente mais tarde.');
                        }
                        if ((_c = error_3.message) === null || _c === void 0 ? void 0 : _c.includes('SAFETY')) {
                            throw new Error('Conteúdo bloqueado por políticas de segurança. Tente um assunto diferente.');
                        }
                        if ((_d = error_3.message) === null || _d === void 0 ? void 0 : _d.includes('PERMISSION_DENIED')) {
                            throw new Error('Permissão negada. Verifique se sua API key tem as permissões necessárias.');
                        }
                        throw new Error("Erro ao gerar roteiro: ".concat(error_3.message || 'Erro desconhecido'));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    GeminiService.prototype.refineText = function (selectedText, refinementInstruction) {
        return __awaiter(this, void 0, void 0, function () {
            var prompt_2, result, response, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (!this.isConfigured()) {
                            throw new Error('Gemini API não configurado. Configure sua API key primeiro.');
                        }
                        prompt_2 = "\nRefine o seguinte texto seguindo as instru\u00E7\u00F5es fornecidas.\n\nTEXTO ORIGINAL:\n\"".concat(selectedText, "\"\n\nINSTRU\u00C7\u00D5ES PARA REFINAMENTO:\n").concat(refinementInstruction, "\n\nDIRETRIZES:\n- Mantenha o significado original\n- Aplique apenas as mudan\u00E7as solicitadas\n- Mantenha o mesmo estilo se n\u00E3o especificado diferente\n- Retorne apenas o texto refinado, sem explica\u00E7\u00F5es\n\nTEXTO REFINADO:\n");
                        return [4 /*yield*/, this.model.generateContent(prompt_2)];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, result.response];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.text()];
                    case 3:
                        error_4 = _a.sent();
                        console.error('Erro ao refinar texto:', error_4);
                        throw new Error("Erro ao refinar texto: ".concat(error_4.message || 'Erro desconhecido'));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    GeminiService.prototype.buildPrompt = function (params) {
        var subject = params.subject, platform = params.platform, duration = params.duration, tone = params.tone, audience = params.audience, objective = params.objective;
        return "\nCrie um roteiro ".concat(tone, " para ").concat(platform, " sobre \"").concat(subject, "\".\n\nESPECIFICA\u00C7\u00D5ES:\n- Dura\u00E7\u00E3o: ").concat(duration, "\n- Tom: ").concat(tone, "\n- P\u00FAblico-alvo: ").concat(audience, "\n").concat(objective ? "- Objetivo: ".concat(objective) : '', "\n- Plataforma: ").concat(platform, "\n\nFORMATO DO ROTEIRO:\n1. **GANCHO** (primeiros 3-5 segundos):\n   - Frase impactante que prende a aten\u00E7\u00E3o\n\n2. **INTRODU\u00C7\u00C3O** (5-10 segundos):\n   - Apresenta\u00E7\u00E3o do tema\n   - Promise do que ser\u00E1 entregue\n\n3. **DESENVOLVIMENTO** (corpo principal):\n   - Conte\u00FAdo principal organizado\n   - Pontos pr\u00E1ticos e acion\u00E1veis\n   - Exemplos concretos\n\n4. **CONCLUS\u00C3O** (\u00FAltimos 5-10 segundos):\n   - Resumo do valor entregue\n   - Call-to-action espec\u00EDfico\n\nDIRETRIZES ESPEC\u00CDFICAS PARA ").concat(platform.toUpperCase(), ":\n").concat(this.getPlatformGuidelines(platform), "\n\nINSTRU\u00C7\u00D5ES IMPORTANTES:\n- Use linguagem ").concat(tone, "\n- Adapte para ").concat(audience, "\n- Mantenha a dura\u00E7\u00E3o aproximada de ").concat(duration, "\n- Inclua timing aproximado para cada se\u00E7\u00E3o\n- Seja espec\u00EDfico e pr\u00E1tico\n- Evite informa\u00E7\u00F5es gen\u00E9ricas\n\nGere apenas o roteiro, sem explica\u00E7\u00F5es adicionais.\n");
    };
    GeminiService.prototype.getPlatformGuidelines = function (platform) {
        var guidelines = {
            'youtube': "\n- In\u00EDcio forte para reter audi\u00EAncia\n- Estrutura clara com introdu\u00E7\u00E3o, desenvolvimento e conclus\u00E3o\n- Call-to-action para like, subscribe e coment\u00E1rios\n- Mencione outros v\u00EDdeos relacionados se relevante",
            'instagram': "\n- Primeira frase deve parar o scroll\n- Visual thinking - descreva elementos visuais\n- Use hashtags estrat\u00E9gicas no final\n- Incentive salvamento e compartilhamento",
            'tiktok': "\n- Hook nos primeiros 2 segundos\n- Ritmo acelerado e din\u00E2mico\n- Trends e sons populares quando poss\u00EDvel\n- Final que incentiva rewatching",
            'linkedin': "\n- Tom profissional mas acess\u00EDvel\n- Insights valiosos para carreira/neg\u00F3cios\n- Storytelling profissional\n- Call-to-action para networking"
        };
        return guidelines[platform.toLowerCase()] || guidelines['youtube'];
    };
    return GeminiService;
}());
exports.GeminiService = GeminiService;
// Instância singleton
exports.geminiService = new GeminiService();
// Função legacy para compatibilidade
var refineText = function (selectedText, refinementInstruction) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, exports.geminiService.refineText(selectedText, refinementInstruction)];
    });
}); };
exports.refineText = refineText;
