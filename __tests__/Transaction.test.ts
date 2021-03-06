import {BaseClient, unaryCall} from "../src/BaseClient";
import {grpc} from "@improbable-eng/grpc-web";
import {Ed25519PrivateKey} from "../src/Keys";
import {AccountCreateTransaction} from "../src/account/AccountCreateTransaction";
import {Transaction} from "../src/Transaction";
import ProtobufMessage = grpc.ProtobufMessage;

const privateKey = Ed25519PrivateKey.fromString('302e020100300506032b657004220420db484b828e64b2d8f12ce3c0a0e93a0b8cce7af1bb8f39c97732394482538e10');

class MockClient extends BaseClient {
    public constructor() {
        super(
            { 'nonexistent-testnet': { shard: 0, realm: 0, account: 3 } },
            {
                account: { shard: 0, realm: 0, account: 2 },
                privateKey
            }
        );
    }

    public [unaryCall]<Rq extends ProtobufMessage, Rs extends ProtobufMessage>(): Promise<Rs> {
        throw new Error('should not be called');
    }
}

const mockClient = new MockClient();

describe('Transaction', () => {
    it('serializes and deserializes correctly', () => {
        const transaction = new AccountCreateTransaction(mockClient)
            .setKey(privateKey.publicKey)
            .setInitialBalance(1e3)
            .setTransactionFee(1e6)
            .build();

        const txnBytes = transaction.toBytes();

        const transaction2 = Transaction.fromBytes(mockClient, txnBytes);

        expect(transaction.toProto()).toStrictEqual(transaction2.toProto());
    })
});
