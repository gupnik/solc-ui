import { PublicKey } from '@solana/web3.js';

type Networks = { [label: string]: Network };

export type Network = {
  // Cluster.
  label: string;
  url: string;
  explorerClusterSuffix: string;

  // Faucets.
  srmFaucet: PublicKey | null;
  msrmFaucet: PublicKey | null;

  // Programs.
  idoProgramId: PublicKey;

  idoPool: PublicKey;

  // Staking instances.
  registrars: { [token: string]: PublicKey };

  // Whitelisted token mints.
  mints: { [token: string]: PublicKey };
};

export const networks: Networks = {
  mainnet: {
    // Cluster.
    label: 'Mainnet Beta',
    url: 'https://api.mainnet-beta.solana.com',
    explorerClusterSuffix: '',

    srmFaucet: null,
    msrmFaucet: null,

    idoProgramId: new PublicKey(
      'GrAkKfEpTKQuVHG2Y97Y2FF4i7y7Q5AHLK94JBy7Y5yv',
    ),
    idoPool: new PublicKey('Ax38AxYCG4WUUXmYrySaXXTGAcjzMGRai4Lc8mW8H1UU'),
    registrars: {
      srm: new PublicKey('5vJRzKtcp4fJxqmR7qzajkaKSiAb6aT9grRsaZKXU222'),
      msrm: new PublicKey('7uURiX2DwCpRuMFebKSkFtX9v5GK1Cd8nWLL8tyoyxZY'),
      fida: new PublicKey('5C2ayX1E2SJ5kKEmDCA9ue9eeo3EPR34QFrhyzbbs3qh'),
    },
    mints: {
      srm: new PublicKey('SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt'),
      msrm: new PublicKey('MSRMcoVyrFxnSgo5uXwone5SKcGhT1KEJMFEkMEWf9L'),
      fida: new PublicKey('EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp'),
    },
  },
  devnet: {
    // Cluster.
    label: 'Devnet',
    url: 'https://devnet.solana.com',
    explorerClusterSuffix: 'devnet',

    srmFaucet: null,
    msrmFaucet: null,

    idoProgramId: new PublicKey(
      '65aMavjMw3EhmWKVCkGn1Uj2SqZ3XY4coJhYM1BVJTHw',
    ),
    idoPool: new PublicKey('Ax38AxYCG4WUUXmYrySaXXTGAcjzMGRai4Lc8mW8H1UU'),
    registrars: {
      token1: new PublicKey('EqbwcuvPWLZ5fav58HrieHmJEqTm6RPu5bmn5bBQJ3mu'),
      token2: new PublicKey('2rDWuS6yVFQ3jYx1nQq7gs3HgzWLJcUwm9sTUBWuXuyK'),
    },
    mints: {
      token1: new PublicKey('Ep6ASaHQ4gKiN3gWNRKYttZEQ7b82seMk9HWc5JNBJZP'),
      token2: new PublicKey('5vWxJthWbCFuNSZj1qcP9WoU8E6UG3DUfeAoPvYoN8PQ'),
    },
  },

  // Fill in with your local cluster addresses.
  localhost: {
    // Cluster.
    label: 'Localhost',
    url: 'http://localhost:8899',
    explorerClusterSuffix: 'localhost',

    srmFaucet: null,
    msrmFaucet: null,

    idoProgramId: new PublicKey(
      '51AJGMBv8DkxEpCTkitMWzsR3yn8hc5TbW3dHk6UyJsw',
    ),
    idoPool: new PublicKey('AVELVUQsZQJXRvNnSvHBmQtL35cv84FeJGbaot6GiBNd'),
    registrars: {
      token1: new PublicKey('Fwi5pie2VgWTDUSRNkca1HdFCke5r3v3mY83JbxtC3CJ'),
      token2: new PublicKey('9kCGBWgHzGGChvmAsmu5jrXwEShZfLxKRTmKdxEpFUBr'),
    },
    mints: {
      token1: new PublicKey('2aE1pietadYMeDtdqKayS4SVo9W4xtC3U7SN4iGWCVcX'),
      token2: new PublicKey('Cgan7PWyBH6Z7JNA6f9kDYgwBMZBxRexpdd29PJgnqah'),
    },
  },
};