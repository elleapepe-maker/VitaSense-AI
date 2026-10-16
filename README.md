# VitaSense-AI
## Directory Structure
```
VitaSense-AI/
├── lovable/ #Code for lovable 
    ├── dataset_utils.py
    ├── vllm_categorize_input.py #use vllm to label input prompts 
    ├── vllm_categorize_output.py #use vllm to label output responses
    └── dataset_utils.py #parsing think traces from OSS models
├── node_module/ #Node library for web apps 
    ├── dataset_utils.py
    ├── filter_samples.py #filter by input categories to select samples for multi-turn
    ├── vllm_synthesize_one_turn.py
    └── vllm_synthesize_multi_turn.py 
├── embeddings/ # for embedding inputs stage
    ├── TBD- TODO: embed input prompts + find clusters 
├── slurm_scripts/
    ├── cat.sh #categorize given prompt, input data agnostic
    ├── filter.sh #run filter_samples.py
    ├── gen.sh #generate model response to emotional prompts
    └── syn.sh #generate persona-based synthetic data
├── synthetic_data/ #scripts for generating persona-based synthetic data
    └── api_synthesize.py
└── files/               # gitignored, outputs + runtime artifacts
```
The `files` should contain all the directories for the outputs, results, and logs.
