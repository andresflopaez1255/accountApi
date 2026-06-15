import { parseBotCodexInput } from './botCodex.parser';
import { registerStreamingAccountInFirebase } from './botCodex.service';
import { buildBotCodexHelpMessage } from './botCodex.templates';
import { BotCodexRegistrationResult } from './botCodex.types';

export const botCodexHelpMessage = buildBotCodexHelpMessage;

export const registerStreamingAccountFromText = async (
	input: string
): Promise<BotCodexRegistrationResult> => {
	const parsedInput = parseBotCodexInput(input);

	if (!parsedInput) {
		throw new Error(buildBotCodexHelpMessage());
	}

	return registerStreamingAccountInFirebase(parsedInput);
};

export * from './botCodex.constants';
export * from './botCodex.parser';
export * from './botCodex.service';
export * from './botCodex.session';
export * from './botCodex.templates';
export * from './botCodex.types';
