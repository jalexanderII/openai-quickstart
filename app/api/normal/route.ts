import {openai, p} from "@/app/openai";
import OpenAI from "openai";
import {Completion, CompletionResponse, Log, Message, trace} from "parea-ai";
import ChatCompletionMessageParam = OpenAI.ChatCompletionMessageParam;

export const runtime = "nodejs";

function isBetween1AndN(log: Log): number {
    // Evaluates if the number is between 1 and n
    if (!log || !log?.inputs || !log?.output) {
        return 0.0;
    }
    const n = log.inputs?.['n'];
    try {
        return 1.0 <= parseFloat(log.output) && parseFloat(log.output) <= parseFloat(n) ? 1.0 : 0.0;
    } catch (e) {
        return 0.0;
    }
}

const callLLM = async (
    data: Message[],
    model: string = 'gpt-4o',
    temperature: number = 0.0,
): Promise<CompletionResponse> => {
    const completion: Completion = {
        llm_configuration: {
            model: model,
            model_params: {temp: temperature},
            messages: data,
        },
    };
    return await p.completion(completion);
};

const generateRandomNumber = trace(
    'generateRandomNumber',
    async (n: string): Promise<string> => {
        const response = await callLLM([{role: 'user', content: `Generate a number between 1 and ${n}.`}]);
        return response.content;
    },
    {
        evalFuncs: [isBetween1AndN],
    },
);

async function runExperiment() {
    const e = p.experiment(
        'Random Numbers',
        [{n: '10'}, {n: '20'}], // Data to run the experiment on (list of dicts)
        generateRandomNumber, // Function to run (callable)
        {nTrials: 3}
    );
    return await e.run();
}


export async function POST(request) {
    const {content} = await request.json();

    if (content === "experiment") {
        await runExperiment();
        const response = {
            "id": "chatcmpl-9jdcRL9u260GxzifObGDl5oe27HgJ",
            "object": "chat.completion",
            "created": 1720664083,
            "model": "gpt-4o-2024-05-13",
            "choices": [
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": "Experiment done!"
                    },
                    "logprobs": null,
                    "finish_reason": "stop"
                }
            ],
            "usage": {
                "prompt_tokens": 0,
                "completion_tokens": 0,
                "total_tokens": 0
            },
            "system_fingerprint": "fp_dd932ca5d1"
        }
        return new Response(JSON.stringify(response))
    }

    const messages: ChatCompletionMessageParam[] = [{
        role: "user",
        content: content,
    }];

    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
    });

    return new Response(JSON.stringify(response))
}

