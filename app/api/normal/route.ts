import {openai, p} from "@/app/openai";
import OpenAI from "openai";
import {levenshtein, trace} from "parea-ai";
import ChatCompletionMessageParam = OpenAI.ChatCompletionMessageParam;

export const runtime = "nodejs";

const greet = trace(
    'greetings',
    (name: string): string => {
        return `Hello ${name}`;
    },
    {
        evalFuncs: [levenshtein],
    },
);

async function runExperiment() {
    const e = p.experiment(
        'Greetings',
        [{name: 'Foo', target: 'Hi Foo'}, {name: 'Bar', target: 'Hello Bar'}],
        greet,
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

