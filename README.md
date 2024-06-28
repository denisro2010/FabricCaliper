
# Hyperledger Fabric and Caliper Setup

This repository contains scripts and configurations to set up a Hyperledger Fabric network, deploy chaincode, and benchmark it using Hyperledger Caliper. Below are detailed instructions to replicate the environment and perform the necessary operations.

## Prerequisites

Before you begin, ensure you have the following installed:
- Docker
- Docker Compose
- Node Version Manager (nvm)
- Node.js (version 12)
- Hyperledger Fabric binaries and Docker images

## Setting Up the Hyperledger Fabric Network

To set up the Hyperledger Fabric network with a specific channel and CouchDB as the state database, use the following commands:

```sh
./network.sh up createChannel -ca -c mychannel -s couchdb
```

To bring down the network, use:

```sh
./network.sh down
```

### Step-by-Step Breakdown:
- `./network.sh up createChannel -ca -c mychannel -s couchdb`: 
  - `up`: Brings up the network.
  - `createChannel`: Creates a new channel.
  - `-ca`: Uses Certificate Authorities for generating the crypto materials.
  - `-c mychannel`: Specifies the channel name as `mychannel`.
  - `-s couchdb`: Specifies CouchDB as the state database.

- `./network.sh down`: Shuts down the network and removes all associated containers.

## Node.js Version Management

To manage Node.js versions and ensure compatibility with Hyperledger Caliper, use nvm:

```sh
nvm install 12
nvm use 12
```

## Binding Caliper to Hyperledger Fabric

Hyperledger Caliper needs to be bound to the specific version of Hyperledger Fabric being used:

```sh
npx caliper bind --caliper-bind-sut fabric:2.2
```

This command binds Caliper to Fabric v2.2.

## Deploying Chaincode

For deploying chaincode on the Fabric network, follow the official Hyperledger Fabric documentation:
[Deploy Chaincode](https://hyperledger-fabric.readthedocs.io/en/release-2.5/deploy_chaincode.html)

## Running Caliper Benchmark

To launch the Caliper benchmark, use the following command:

```sh
npx caliper launch manager --caliper-workspace ./ --caliper-benchconfig benchmark/my-benchmark.yaml --caliper-networkconfig benchmark/networkconfig.yaml
```

### Step-by-Step Breakdown:
- `npx caliper launch manager`: Launches the Caliper benchmark.
- `--caliper-workspace ./`: Specifies the Caliper workspace directory.
- `--caliper-benchconfig benchmark/my-benchmark.yaml`: Specifies the benchmark configuration file.
- `--caliper-networkconfig benchmark/networkconfig.yaml`: Specifies the network configuration file.

## Configuring Raft Consensus

To configure Raft consensus in your Hyperledger Fabric network, follow these steps:

1. **Modify `configtx.yaml`:**

   In the `Profiles` section of your `configtx.yaml`, specify the `OrdererType` as `etcdraft`.

   ```yaml
   Orderer:
     OrdererType: etcdraft
     Addresses:
       - orderer.example.com:7050
     EtcdRaft:
       Consenters:
         - Host: orderer.example.com
           Port: 7050
           ClientTLSCert: path/to/orderer/tls/client.crt
           ServerTLSCert: path/to/orderer/tls/server.crt
     Organizations:
       - *OrdererOrg
   ```

2. **Generate the Genesis Block:**

   Generate the genesis block with the Raft configuration using `configtxgen`:

   ```sh
   configtxgen -profile SampleDevModeEtcdRaft -channelID system-channel -outputBlock ./channel-artifacts/genesis.block
   ```

3. **Update `docker-compose.yaml`:**

   Ensure your `docker-compose.yaml` includes the necessary configurations for the orderer with Raft consensus.

   ```yaml
   orderer.example.com:
     container_name: orderer.example.com
     image: hyperledger/fabric-orderer:2.2
     environment:
       - ORDERER_GENERAL_LISTENADDRESS=0.0.0.0
       - ORDERER_GENERAL_LISTENPORT=7050
       - ORDERER_GENERAL_GENESISMETHOD=file
       - ORDERER_GENERAL_GENESISFILE=/var/hyperledger/orderer/genesis.block
       - ORDERER_GENERAL_LOCALMSPID=OrdererMSP
       - ORDERER_GENERAL_LOCALMSPDIR=/var/hyperledger/orderer/msp
       - ORDERER_GENERAL_TLS_ENABLED=true
       - ORDERER_GENERAL_TLS_PRIVATEKEY=/var/hyperledger/orderer/tls/server.key
       - ORDERER_GENERAL_TLS_CERTIFICATE=/var/hyperledger/orderer/tls/server.crt
       - ORDERER_GENERAL_TLS_ROOTCAS=[/var/hyperledger/orderer/tls/ca.crt]
     volumes:
       - ./channel-artifacts/genesis.block:/var/hyperledger/orderer/genesis.block
       - ./crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp:/var/hyperledger/orderer/msp
       - ./crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/:/var/hyperledger/orderer/tls
     ports:
       - 7050:7050
   ```

4. **Start the Network:**

   Start your network with the Raft orderer configuration:

   ```sh
   ./network.sh up -o etcdraft
   ```

By following these steps, you can set up a Hyperledger Fabric network with Raft consensus and benchmark it using Hyperledger Caliper.

 
