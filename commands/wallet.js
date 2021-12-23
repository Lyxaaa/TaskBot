const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { taskIcon } = require('../config.json');
const StellarSdk = require('stellar-sdk');

const testPassphrase = StellarSdk.Networks.TESTNET;
const testServer = new StellarSdk.Server('https://horizon-testnet.stellar.org');

const livePassphrase = StellarSdk.Networks.PUBLIC;
const liveServer = new StellarSdk.Server('https://horizon.stellar.org/');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wallet')
        .setDescription('Get info about a Stellar wallet!')
        .addStringOption(option =>
            option.setName('key')
                .setDescription('The Public Key of the Wallet you\'d like to view')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('server')
                .setDescription('Specify which Stellar server to use')
                .addChoice('Live', 'live')
                .addChoice('Test', 'test')),
    async execute(interaction) {
        const key = interaction.options.getString('key')
        const server = interaction.options.getString('server')
        //interaction.reply('Getting wallet info');
        let account;
        if (server === 'test') {
            account = await testServer.loadAccount(key);
        } else {
            account = await liveServer.loadAccount(key);
        }
        await interaction.reply({embeds: [await getBalance(key, account)]});

    },
};

var fee

async function setup() {
    fee = await server.fetchBaseFee();
    const account = await server.loadAccount(publicKey);

    const nativeAsset = new StellarSdk.Asset.native()

}

async function getBalance(publicKey, account) {
    let walletEmbed = new MessageEmbed()
        .setColor('#22CA94')
        .setTitle(`View wallet on stellar.expert`)
        .setURL(`https://stellar.expert/explorer/public/account/${publicKey}`)
        .setAuthor('Task', taskIcon, 'https://task.io/')
        .setDescription('Replace this with a link to Task NFT Wallet')
        .setThumbnail(taskIcon)
        .addFields(
            { name: 'Balances of wallet', value: `${publicKey}` },
            { name: '\u200B', value: '\u200B' },
        )
        //.setImage('https://i.imgur.com/AfFp7pu.png')
        .setTimestamp()
        .setFooter('Some footer text here', taskIcon);

    account.balances.forEach(function (balance) {
        let name
        if (balance.asset_code) {
            name = balance.asset_code
        } else if (balance.asset_type === StellarSdk.Asset.native().getAssetType()) {
            name = 'XLM'
        } else {
            name = balance.asset_type
        }
        walletEmbed.addField(name, balance.balance, true)
        console.log("Type:", balance.asset_type, "Code:", balance.asset_code, ", Balance:", balance.balance);
    });
    return walletEmbed
}

async function submitTransaction(transaction) {
    console.log(transaction.toEnvelope().toXDR('base64'))
    try {
        const transactionResult = await server.submitTransaction(transaction);
        console.log(JSON.stringify(transactionResult, null, 2));
        console.log('\nSuccess, view transaction');
    } catch (e) {
        console.log('An error has occurred', e['response']['data']['extras'])
    }
}