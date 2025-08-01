import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { getContractConfig, NetworkType, ContractAddresses } from "./config";

// 当前网络
const currentNetwork = (process.env.NEXT_PUBLIC_NETWORK as NetworkType) || "testnet";

// 网络映射配置
const NETWORK_MAPPING: Record<NetworkType, Network> = {
    devnet: Network.DEVNET,
    testnet: Network.TESTNET,
    mainnet: Network.MAINNET,
    'movement-testnet': Network.CUSTOM,
    'movement-mainnet': Network.CUSTOM,
};

// 创建自定义的 Aptos 配置，支持 Movement 网络和自定义 API 配置
function createAptosConfig(): AptosConfig {
    const nodeUrl = process.env.NEXT_PUBLIC_NODE_URL;
    const faucetUrl = process.env.NEXT_PUBLIC_FAUCET_URL;

    // 自定义 API 配置选项
    const withCredentials = process.env.NEXT_PUBLIC_WITH_CREDENTIALS === 'true';
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;

    // 构建客户端配置
    const clientConfig: any = {};
    if (process.env.NEXT_PUBLIC_WITH_CREDENTIALS !== undefined) {
        clientConfig.WITH_CREDENTIALS = withCredentials;
    }
    if (apiKey) {
        clientConfig.API_KEY = apiKey;
    }

    // 如果提供了自定义的节点 URL（如 Movement），则使用自定义配置
    if (nodeUrl) {
        return new AptosConfig({
            network: NETWORK_MAPPING[currentNetwork], // 必须指定网络
            fullnode: nodeUrl,
            faucet: faucetUrl,
            ...(Object.keys(clientConfig).length > 0 && { clientConfig }),
        });
    }

    // 否则使用官方 Aptos 网络
    return new AptosConfig({
        network: NETWORK_MAPPING[currentNetwork],
        ...(Object.keys(clientConfig).length > 0 && { clientConfig }),
    });
}

// 创建 Aptos 配置
const aptosConfig = createAptosConfig();

// 创建 Aptos 客户端实例
const aptosClient = new Aptos(aptosConfig);

// 获取当前网络的合约配置
function getNetworkVariables(): ContractAddresses {
    return getContractConfig(currentNetwork);
}

// 创建更好的交易工厂函数
function createBetterTxFactory<T extends Record<string, unknown>>(
    fn: (networkVariables: ContractAddresses, params: T) => any
) {
    return (params: T) => {
        const networkVariables = getNetworkVariables();
        return fn(networkVariables, params);
    };
}

export {
    aptosClient,
    currentNetwork,
    getNetworkVariables,
    createBetterTxFactory,
    createAptosConfig
};

export type { ContractAddresses };
