import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor"
import { Program } from "@coral-xyz/anchor";
import { AmmAnchor } from "../target/types/amm_anchor"
import { PublicKey, Commitment, Keypair, SystemProgram, Connection } from "@solana/web3.js"
import { ASSOCIATED_TOKEN_PROGRAM_ID as associatedTokenProgram, TOKEN_PROGRAM_ID as tokenProgram, createMint, createAccount, mintTo, getAssociatedTokenAddress, TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount } from "@solana/spl-token"
import { randomBytes } from "crypto"
import { assert } from "chai"
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";


const commitment: Commitment = "confirmed";

describe("amm-anchor", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.ammAnchor as Program<AmmAnchor>;

  const provider = anchor.getProvider();

  const connection = provider.connection;

  // set up keys for initializer and user

  const [admin, user] = [new Keypair(), new Keypair];

  // randoms seed

  const seed = new BN(randomBytes(8));
  const fee = 30; // 0.3% fee
  const DECIMALS = 6;

  const config = PublicKey.findProgramAddressSync([Buffer.from("config"), seed.toArrayLike(Buffer, "le", 8)], program.programId)[0];



  // Mints
  let mint_x: PublicKey;
  let mint_y: PublicKey;
  let mint_lp = PublicKey.findProgramAddressSync(
    [Buffer.from("lp"), config.toBuffer()],
    program.programId
  )[0];
 
  // vaults
  let vault_x: PublicKey ;
  let vault_y: PublicKey ;

  // userATAs

  let user_x: PublicKey ;
  let user_y: PublicKey ;
  let user_lp: PublicKey;



  before("Airdrop and create Mints",async () => {

    await Promise.all([admin, user].map(async (k) => {
      return await anchor.getProvider().connection.requestAirdrop(k.publicKey, 100 * anchor.web3.LAMPORTS_PER_SOL)
    })).then(confirmTxs);

    // create mint
    mint_x = await createMint(
      connection,
      admin,
      admin.publicKey,
      admin.publicKey,
      DECIMALS
    )

    mint_y = await createMint(
      connection,
      admin,
      admin.publicKey,
      admin.publicKey,
      DECIMALS
    )

    vault_x = await getAssociatedTokenAddress(
      mint_x,
      config,
      true
    )

    vault_y = await getAssociatedTokenAddress(
      mint_y,
      config,
      true
    )

    user_x = (await getOrCreateAssociatedTokenAccount(
      connection,
      user,
      mint_x,
      user.publicKey,
      true
    )).address

    user_y = (await getOrCreateAssociatedTokenAccount(
      connection,
      user,
      mint_y,
      user.publicKey,
      true
    )).address

    try{
      const mintX = await mintTo(
        connection,
        admin,
        mint_x,
        user_x,
        admin.publicKey,
        1000 * DECIMALS
      )
  
      console.log("mintx", mintX)
    }catch(e) {
      console.log("error whie mint x",e);
    }

    const mintY = await mintTo(
      connection,
      admin,
      mint_y,
      user_y,
      admin.publicKey,
      1000 * DECIMALS
    )

    console.log("mintY", mintY)


  })




  
  let listenerIds: number[] = [];
  before(() => {
    const initializeListner = program.addEventListener("initializeEvent", (event, slot, signature) => {
      console.log("Initialize Event :", event, "Slot :", slot, "signature:", signature);
    });

    listenerIds.push(initializeListner);

    const depositListner = program.addEventListener("depositEvent", (event, slot, signature) => {
      console.log("Deposit Event :", event, "Slot :", slot, "signature:", signature);
    });

    listenerIds.push(depositListner);

    const swapListner = program.addEventListener("swapEvent", (event, slot, signature) => {
      console.log("Swap Event :", event, "Slot :", slot, "signature:", signature);
    });

    listenerIds.push(swapListner);

    const lockListner = program.addEventListener("lockEvent", (event, slot, signature) => {
      console.log("Lock Event :", event, "Slot :", slot, "signature:", signature);
    });

    listenerIds.push(lockListner);

    const unlockListner = program.addEventListener("unlockEvent", (event, slot, signature) => {
      console.log("Unlock Event :", event, "Slot :", slot, "signature:", signature);
    });

    listenerIds.push(unlockListner);

    const withdrawEvent = program.addEventListener("withdrawEvent", (event, slot, signature) => {
      console.log("Withdraw Event :", event, "Slot :", slot, "signature:", signature);
    });

    listenerIds.push(withdrawEvent);

    
  })



  it("Is initialized!", async () => {

     
    // Add your test here.
    const tx = await program.methods.initialize(
      seed,
      fee,
      admin.publicKey
    )
    .accountsStrict({
      admin: admin.publicKey,
      mintX: mint_x,
      mintY: mint_y,
      mintLp: mint_lp,
      vaultX: vault_x,
      vaultY: vault_y,
      config: config,
      tokenProgram,
      associatedTokenProgram,
      systemProgram: SystemProgram.programId,
    })
    .signers([admin])
    .rpc()
    console.log("Your transaction signature", tx);
  });

  it("Deposit!", async () => {
    // because before initilise mint_lp isnt created on chain so it was invalid
    user_lp = (await getOrCreateAssociatedTokenAccount(
      connection,
      user,
      mint_lp,
      user.publicKey,
      true,
    )).address

    // Add your test here.
    const tx = await program.methods.deposit(
      new BN(625), 
      new BN(25),
      new BN(25),
    )
    .accountsStrict({
      user: user.publicKey,
      mintX: mint_x,
      mintY: mint_y,
      config: config,
      mintLp: mint_lp,
      vaultX: vault_x,
      vaultY: vault_y,
      userX: user_x,
      userY: user_y,
      userLp: user_lp,
      tokenProgram,
      associatedTokenProgram,
      systemProgram: SystemProgram.programId,
    })
    .signers([user])
    .rpc()
    console.log("Your transaction signature", tx);
  });

  it("Lock Pool", async () => {
    const tx = await program.methods.lock().accountsStrict({
      user: admin.publicKey,
      config: config
    })
    .signers([admin])
    .rpc()
  })

  it("Unlock Pool", async () => {
    const tx = await program.methods.unlock().accountsStrict({
      user: admin.publicKey,
      config: config
    })
    .signers([admin])
    .rpc()
  })

  it("Swap token X for Y", async () => {
    const tx = await program.methods.swap(
      true,
      new BN(10),
      new BN(6)
    ).accountsStrict({
      user: user.publicKey,
      mintX: mint_x,
      mintY: mint_y,
      config: config,
      mintLp: mint_lp,
      vaultX: vault_x,
      vaultY: vault_y,
      userX: user_x,
      userY: user_y,
      tokenProgram,
      associatedTokenProgram,
      systemProgram: SystemProgram.programId,
    })
    .signers([user])
    .rpc()
    console.log("Your transaction signature", tx);
  });

  it("Swap token Y for X", async () => {
    const tx = await program.methods.swap(
      false,
      new BN(6),
      new BN(5)
    ).accountsStrict({
      user: user.publicKey,
      mintX: mint_x,
      mintY: mint_y,
      config: config,
      mintLp: mint_lp,
      vaultX: vault_x,
      vaultY: vault_y,
      userX: user_x,
      userY: user_y,
      tokenProgram,
      associatedTokenProgram,
      systemProgram: SystemProgram.programId,
    })
    .signers([user])
    .rpc()
    console.log("Your transaction signature", tx);
  });


  it("WithDraw!", async () => {
    // because before initilise mint_lp isnt created on chain so it was invalid
    user_lp = (await getOrCreateAssociatedTokenAccount(
      connection,
      user,
      mint_lp,
      user.publicKey,
      true,
    )).address

    // Add your test here.
    const tx = await program.methods.withdraw(
      new BN(20), 
      new BN(20),
      new BN(30),
    )
    .accountsStrict({
      user: user.publicKey,
      mintX: mint_x,
      mintY: mint_y,
      config: config,
      mintLp: mint_lp,
      vaultX: vault_x,
      vaultY: vault_y,
      userX: user_x,
      userY: user_y,
      userLp: user_lp,
      tokenProgram,
      associatedTokenProgram,
      systemProgram: SystemProgram.programId,
    })
    .signers([user])
    .rpc()
    console.log("Your transaction signature", tx);
  });

  after("cleanup event listeners", async () => {
    for (const id of listenerIds) {
      await program.removeEventListener(id);
    }
    // if you’d rather drop *all* RPC-level listeners on the connection:
    // await provider.connection.removeAllListeners();
  });


});


// Helpers
const confirmTx = async (signature: string) => {
  const latestBlockhash = await anchor.getProvider().connection.getLatestBlockhash();
  await anchor.getProvider().connection.confirmTransaction(
    {
      signature,
      ...latestBlockhash,
    },
    commitment
  )
}

const confirmTxs = async (signatures: string[]) => {
  await Promise.all(signatures.map(confirmTx))
}
