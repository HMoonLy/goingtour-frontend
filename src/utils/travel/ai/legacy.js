/**
 * 旧版兼容层
 */
import { AdvancedPromptGenerator } from './generators';
import { PersonalProfileInterpreter, TripPreferencesInterpreter } from './interpreters';

/**
 * 完整的AI提示词生成器 - 旧版保留以兼容
 * 建议使用 AdvancedPromptGenerator
 */
export class CompletePromptGenerator {
    constructor(personalProfile, tripPreferences, tripContext) {
        this.profileInterpreter = new PersonalProfileInterpreter(personalProfile);
        this.preferencesInterpreter = new TripPreferencesInterpreter(tripPreferences);
        this.tripContext = tripContext;
    }

    generateCompletePrompt() {
        // 使用新版生成器代理
        const generator = new AdvancedPromptGenerator(
            { ...this.profileInterpreter.profile, ...this.preferencesInterpreter.preferences },
            this.tripContext
        );
        return generator.generateCompletePrompt();
    }
}

export default {
    CompletePromptGenerator
};

