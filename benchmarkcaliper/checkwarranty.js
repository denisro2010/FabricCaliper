'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class GetAllAssetsWorkload extends WorkloadModuleBase {
    constructor() {
        super();
    }

    async submitTransaction() {
        // No es necesario un payload para esta función, ya que no toma argumentos
        await this.sutAdapter.sendRequests({
            contractId: 'basic', // Nombre del contrato inteligente
            contractFunction: 'GetAllAssets', // Función del contrato inteligente que quieres llamar
            contractArguments: [], // Sin argumentos necesarios para esta función
            readOnly: true // Indica si la transacción es de solo lectura
        });
    }
}

function createWorkloadModule() {
    return new GetAllAssetsWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;

