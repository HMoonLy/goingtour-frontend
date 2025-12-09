/**
 * AI 提示词生成器
 */
import { PersonalProfileInterpreter } from './interpreters';
import { TRIP_PREFERENCES_OPTIONS } from '../constants/options';
import { getOptionDisplayName } from '../formatters';

/**
 * 🎯 完整的AI提示词生成器
 * 将用户偏好转换为完整的AI指导文档
 */
export class AdvancedPromptGenerator {
    constructor(userPreferences, tripContext) {
        this.userPreferences = userPreferences || {};
        this.tripContext = tripContext || {};
    }

    /**
     * 生成完整的AI提示词结构
     */
    generateAIPrompt() {
        const prompt = {
            // 用户画像总结
            travelerProfile: this.generateTravelerProfile(),

            // 核心需求和约束
            coreRequirements: this.generateCoreRequirements(),
            
            // 环境上下文 (天气等)
            environmentContext: this.generateEnvironmentContext(),

            // 详细的偏好指导
            detailedGuidance: this.generateDetailedGuidance(),

            // 特殊注意事项
            specialConsiderations: this.generateSpecialConsiderations(),

            // 推荐策略
            recommendationStrategy: this.generateRecommendationStrategy(),
            
            // 输出格式要求
            outputFormat: this.generateOutputFormat()
        };

        return prompt;
    }

    /**
     * 生成旅行者画像总结
     */
    generateTravelerProfile() {
        let profile = [];
        const preferences = this.userPreferences;

        // MBTI性格解读
        if (preferences.mbtiType) {
            const mbtiInterpreter = new PersonalProfileInterpreter({ mbtiType: preferences.mbtiType });
            const mbtiPrompt = mbtiInterpreter.getMBTIBehaviorPrompt();
            profile.push(`性格特征: ${mbtiPrompt}`);
        }

        // 核心兴趣解读
        if (preferences.coreInterests?.length > 0) {
            const interpreter = new PersonalProfileInterpreter({ coreInterests: preferences.coreInterests });
            const interestPrompt = interpreter.getCoreInterestsPrompt();
            profile.push(`核心兴趣: ${interestPrompt}`);
        }

        // 预算和消费水平
        if (preferences.budget) {
            profile.push(`预算水平: ${preferences.budget}，需要在此预算范围内提供最优化的体验建议`);
        }

        return profile.join('\n');
    }

    /**
     * 生成核心需求和约束
     */
    generateCoreRequirements() {
        const requirements = [];
        const tripContext = this.tripContext;

        // 时间和地点约束
        const destination = tripContext.destinationName || tripContext.destination;
        if (destination) {
            requirements.push(`目的地: ${destination}`);
        }
        
        const duration = tripContext.days || tripContext.duration;
        if (duration) {
            requirements.push(`旅行时长: ${duration}天`);
        }
        
        const travelers = tripContext.travelers;
        if (travelers) {
            requirements.push(`出行人数: ${travelers}人`);
        }

        // 处理日期范围
        let dateInfo = '待定';
        if (tripContext.dateRange && Array.isArray(tripContext.dateRange) && tripContext.dateRange.length === 2) {
            try {
                // 简单格式化日期，如果对象是Date类型
                const start = new Date(tripContext.dateRange[0]).toLocaleDateString();
                const end = new Date(tripContext.dateRange[1]).toLocaleDateString();
                dateInfo = `${start} 至 ${end}`;
            } catch (e) {
                dateInfo = `${tripContext.dateRange[0]} 至 ${tripContext.dateRange[1]}`;
            }
        } else if (tripContext.startDate) {
            dateInfo = tripContext.startDate;
        }
        requirements.push(`出行时间: ${dateInfo}`);
        
        // 必去 POI (Attractions, Restaurants, Hotels)
        if (tripContext.selectedAttractions && tripContext.selectedAttractions.length > 0) {
            const names = tripContext.selectedAttractions.map(a => a.name).join('、');
            requirements.push(`必去景点: ${names} (请务必安排在行程中)`);
        }
        
        if (tripContext.selectedRestaurants && tripContext.selectedRestaurants.length > 0) {
            const names = tripContext.selectedRestaurants.map(r => r.name).join('、');
            requirements.push(`必吃餐厅: ${names} (请务必安排用餐)`);
        }
        
        if (tripContext.selectedHotels && tripContext.selectedHotels.length > 0) {
            const names = tripContext.selectedHotels.map(h => h.name).join('、');
            requirements.push(`入住酒店: ${names}`);
        }

        return requirements.join('\n');
    }
    
    /**
     * 生成环境上下文 (天气等)
     */
    generateEnvironmentContext() {
        const contexts = [];
        const weather = this.tripContext.weatherSuggestion;
        
        if (weather) {
            let weatherText = "天气情况: ";
            if (weather.isHistorical) {
                weatherText += `基于历史数据，预计天气${weather.weatherDesc}，气温${weather.tempRange}。`;
                if (weather.season) weatherText += ` 正值${weather.season}。`;
            } else {
                weatherText += `实时预报显示天气${weather.weatherDesc}，气温${weather.tempRange}。`;
            }
            
            if (weather.tips && weather.tips.length > 0) {
                weatherText += ` 建议：${weather.tips.join('；')}。`;
            }
            
            contexts.push(weatherText);
            
            // 如果有具体的预报数据
            if (weather.forecast && weather.forecast.length > 0) {
                const forecastSummary = weather.forecast.slice(0, 3).map(f => 
                    `${f.date}: ${f.dayWeather} (${f.dayTemp}/${f.nightTemp}℃)`
                ).join('; ');
                contexts.push(`近期预报参考: ${forecastSummary}...`);
            }
        }
        
        return contexts.join('\n');
    }

    /**
     * 生成详细偏好指导
     */
    generateDetailedGuidance() {
        const guidance = {
            景点选择: [],
            餐饮安排: [],
            交通方式: [],
            时间分配: [],
            体验重点: []
        };

        const preferences = this.userPreferences;
        const context = this.tripContext;

        // --- 1. 基于核心兴趣 (Long-term) ---
        if (preferences.coreInterests?.includes('nature')) {
            guidance.景点选择.push("至少30%的行程安排在自然环境中，优先选择视野开阔的户外空间");
        }
        if (preferences.coreInterests?.includes('photography')) {
            guidance.景点选择.push("重视视觉效果，优先选择有设计感或独特视角的场所");
            guidance.时间分配.push("每个景点预留额外15-30分钟拍摄时间");
        }
        if (preferences.coreInterests?.includes('food')) {
            guidance.餐饮安排.push("每餐都安排当地特色，包括街头小吃、传统餐厅和创意料理");
        }
        
        // --- 2. 基于本次行程偏好 (Short-term) ---
        // 体验重点 (Focus Areas)
        if (context.focusAreas && context.focusAreas.length > 0) {
            const areas = context.focusAreas.map(area => {
               const opt = TRIP_PREFERENCES_OPTIONS.focusAreas.options[area];
               return opt ? opt.name : area;
            }).join('、');
            guidance.体验重点.push(`本次旅行特别关注：${areas}`);
            
            // 特定逻辑
            if (context.focusAreas.includes('urban_lifestyle')) {
                 guidance.景点选择.push("包含当地商业区、文创园或地标建筑");
            }
        }
        
        // 节奏偏好 (Pace)
        if (context.pacePreference) {
            const paceOpt = TRIP_PREFERENCES_OPTIONS.pacePreference.options[context.pacePreference];
            if (paceOpt) {
                guidance.时间分配.push(paceOpt.aiPrompt || paceOpt.description);
            }
        }
        
        // 社交偏好 (Social)
        if (context.socialPreference) {
             const socialOpt = TRIP_PREFERENCES_OPTIONS.socialPreference.options[context.socialPreference];
             if (socialOpt) {
                 guidance.景点选择.push(socialOpt.aiPrompt || socialOpt.description);
             }
        }
        
        // 拍照偏好 (Photo) - 覆盖核心兴趣
        if (context.photoPreference === 'essential') {
             guidance.时间分配.push("必须预留充足的摄影时间，推荐最佳机位");
        }

        return Object.entries(guidance)
            .filter(([, items]) => items.length > 0)
            .map(([category, items]) => `${category}: ${items.join('；')}`)
            .join('\n');
    }

    /**
     * 生成特殊注意事项
     */
    generateSpecialConsiderations() {
        const considerations = [];
        const preferences = this.userPreferences; // 长期
        const context = this.tripContext; // 本次

        // 1. 饮食禁忌 (合并长期和本次)
        const restrictions = [
            ...(preferences.dietaryRestrictions || []),
            ...(context.dietaryRestrictions || [])
        ];
        
        if (restrictions.length > 0) {
            const uniqueRestrictions = [...new Set(restrictions)];
            const interpreter = new PersonalProfileInterpreter({ dietaryRestrictions: uniqueRestrictions });
            considerations.push(interpreter.getDietaryPrompt());
        }
        
        // 自定义饮食备注
        if (context.customDietaryNotes) {
            considerations.push(`其他饮食要求: ${context.customDietaryNotes}`);
        }

        // 2. 特殊需求 (Extra Requirements)
        // 从 temporaryNeeds 或 extraRequirements 字段
        if (preferences.needAccessibility) considerations.push("必须考虑无障碍设施和通道");
        if (preferences.includeKidsActivities) considerations.push("需要安排适合儿童的活动和设施");
        
        if (context.extraRequirements) {
            considerations.push(`用户备注: ${context.extraRequirements}`);
        }
        
        // 3. 预算限制
        if (context.budget) {
            // Need to import or duplicate getOptionDisplayName logic. 
            // Importing getOptionDisplayName from formatters might cause circular dep if formatters imports something else.
            // But formatters/index.js only imports constants.
            // However, AdvancedPromptGenerator is in `ai/` folder.
            // Let's implement helper here or use the one from travel/constants/options.js
            
            // Actually, getOptionDisplayName is a formatter. 
            // Let's import it from ../formatters/index.js to be safe, 
            // but we need to make sure options are available.
            // Or just inline simple logic here since we have TRIP_PREFERENCES_OPTIONS imported.
            
            // Re-using options directly:
            const categories = { ...TRIP_PREFERENCES_OPTIONS, budgetLevel: { options: {} } }; // Wait, budgetLevel is in PERSONAL_PROFILE_OPTIONS
            // Let's just use a string for now or fix this properly.
            // The original code used getOptionDisplayName('budgetLevel', context.budget);
            // We should import getOptionDisplayName from ../../travel/formatters/index.js
            // But wait, the previous file write for formatters/index.js uses relative imports.
            
            // Let's import getOptionDisplayName from the formatter utility we just created.
            // But we need to make sure we don't create circular deps.
            // formatters/index.js imports constants/options.js.
            // generators.js imports constants/options.js.
            // So generators.js importing formatters/index.js is fine.
            
            // Wait, I can't import inside the class method.
            // I'll assume getOptionDisplayName is available from imports.
            // I'll add the import at the top.
            
            const budgetText = getOptionDisplayName('budgetLevel', context.budget);
            considerations.push(`预算控制: ${budgetText}`);
        }

        return considerations.join('\n');
    }

    /**
     * 生成推荐策略
     */
    generateRecommendationStrategy() {
        const strategies = [];
        const preferences = this.userPreferences;
        const tripContext = this.tripContext;

        // 基于MBTI的推荐策略
        if (preferences.mbtiType) {
            const mbtiInterpreter = new PersonalProfileInterpreter({ mbtiType: preferences.mbtiType });
            const mbtiPrompt = mbtiInterpreter.getMBTIBehaviorPrompt();
            strategies.push(`个性化策略: ${mbtiPrompt}`);
        }

        // 基于行程目的的策略调整
        if (tripContext.tripPurpose) {
             const purposeOpt = TRIP_PREFERENCES_OPTIONS.tripPurpose.options[tripContext.tripPurpose];
             if (purposeOpt) {
                 strategies.push(`行程主旨: ${purposeOpt.aiPrompt || purposeOpt.aiStrategy}`);
             }
        }

        return strategies.join('\n');
    }
    
    /**
     * 生成输出格式要求
     */
    generateOutputFormat() {
        const style = this.tripContext.generationStyle || 'table';
        
        let formatPrompt = "";
        
        switch (style) {
            case 'table':
                formatPrompt = "以清晰的时间表形式呈现每日行程，精确到小时。";
                break;
            case 'narrative':
                formatPrompt = "以游记叙述的方式呈现，注重描绘体验感和氛围，文字优美。";
                break;
            case 'checklist':
                formatPrompt = "以清单列表形式呈现，重点突出打卡项目和待办事项，简洁明了。";
                break;
            case 'card':
                formatPrompt = "以卡片式结构呈现，每个地点作为独立单元，包含核心信息。";
                break;
            default:
                formatPrompt = "以结构化的方式呈现行程。";
        }
        
        return `请${formatPrompt} 必须包含JSON格式的结构化数据以便程序解析。`;
    }

    /**
     * 生成最终的完整AI提示词
     */
    generateCompletePrompt() {
        const promptStructure = this.generateAIPrompt();

        // 过滤空的部分
        const sections = [
            { title: "用户画像", content: promptStructure.travelerProfile },
            { title: "核心需求", content: promptStructure.coreRequirements },
            { title: "环境上下文", content: promptStructure.environmentContext },
            { title: "详细指导", content: promptStructure.detailedGuidance },
            { title: "特殊注意事项", content: promptStructure.specialConsiderations },
            { title: "推荐策略", content: promptStructure.recommendationStrategy },
            { title: "输出要求", content: promptStructure.outputFormat }
        ].filter(s => s.content && s.content.trim().length > 0);

        return `# 旅行规划AI助手指令

${sections.map(s => `## ${s.title}\n${s.content}`).join('\n\n')}

请基于以上信息，为用户生成个性化的旅行推荐。确保推荐内容符合用户的性格特征、兴趣偏好和实际约束条件。`;
    }
}

/**
 * 便捷函数 - 直接生成AI提示词
 */
export function generateAIPrompt(userPreferences, tripContext) {
    const generator = new AdvancedPromptGenerator(userPreferences, tripContext);
    return generator.generateAIPrompt();
}

export function generateCompletePrompt(userPreferences, tripContext) {
    const generator = new AdvancedPromptGenerator(userPreferences, tripContext);
    return generator.generateCompletePrompt();
}

export default {
    AdvancedPromptGenerator,
    generateAIPrompt,
    generateCompletePrompt
};

