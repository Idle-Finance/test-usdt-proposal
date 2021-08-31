import { task } from "hardhat/config"

const ProxyAdminABI = require("../abi/ProxyAdmin.json")
const IdleTokenABI = require("../abi/IdleTokenGovernance.json")
const addresses = require("../common/addresses")
const { LedgerSigner } = require("@ethersproject/hardware-wallets");
const {SafeEthersSigner, SafeService}  = require("@gnosis.pm/safe-ethers-adapters");
const { types } = require("hardhat/config");

export default task("iip-upgrade", "Generic iip to upgrade Idle tokens")
  .addParam("description", "The proposal description")
  .addParam("implementation", "The new implementation address")
  .addParam("initMethod", "The method to call with upgradeAndCall", "")
  .addParam("initSig", "The method signature to call with upgradeAndCall", "")
  .addParam("execute", "Execute or return proposal", false, types.boolean)
  .setAction(async(args, hre) => {

  const isLocalNet = hre.network.name == 'hardhat';
  const newImplementationAddress = args.implementation;
  const initMethod = args.initMethod;
  const initSig = args.initSig;
  const proposalDescription = args.description;

  const idleTokens = addresses.allIdleTokensBest;
  const proxyAdmin = await hre.ethers.getContractAt(ProxyAdminABI, addresses.proxyAdmin);

  let proposalBuilder = hre.proposals.builders.alpha();

  for (let i = 0; i < idleTokens.length; i++) {
    const idleTokenAddress = idleTokens[i];
    if (initSig == "") {
      proposalBuilder = proposalBuilder.addContractAction(proxyAdmin, "upgrade", [
        idleTokenAddress,
        newImplementationAddress,
      ]);
    } else {
      const abi = [`function ${initSig}`];
      const iface = new hre.ethers.utils.Interface(abi);
      const initMethodCall = iface.encodeFunctionData(initMethod, [])

      proposalBuilder = proposalBuilder.addContractAction(proxyAdmin, "upgradeAndCall", [
        idleTokenAddress,
        newImplementationAddress,
        initMethodCall,
      ]);
    }
  }

  proposalBuilder.setDescription(proposalDescription);

  if (!args.execute) {
    return proposalBuilder;
  }

  const proposal = proposalBuilder.build()
  await proposal.printProposalInfo();


  if (isLocalNet) {
    console.log("Simulating proposal")
    const WHALE_ADDRESS = addresses.devLeagueMultisig;
    await hre.network.provider.send("hardhat_impersonateAccount", [WHALE_ADDRESS]);
    let signer = await hre.ethers.getSigner(WHALE_ADDRESS);
    await hre.network.provider.send("hardhat_setBalance", [WHALE_ADDRESS, "0xffffffffffffffff"]);
    proposal.setProposer(signer);
    // To run full simulation, set the flag for simulate to `true`
    await proposal.simulate();
    console.log("Proposal simulated :)");
    console.log();
  } else {
    console.log('Posting proposal on-chain with Dev League Multisig');
    const ledgerSigner = new LedgerSigner(hre.ethers.provider, undefined, "m/44'/60'/0'/0/0");
    const service = new SafeService('https://safe-transaction.gnosis.io/');
    const signer = await SafeEthersSigner.create(addresses.devLeagueMultisig, ledgerSigner, service, hre.ethers.provider);
    proposal.setProposer(signer);
    await proposal.propose();
    console.log("Proposal is live");
  }
});
