import React, { Component } from 'react';
import web3 from 'web3';
import { Container, Form, FormControl, FormGroup, FormLabel, Row, Spinner, Table } from 'react-bootstrap';
import etherscan from '../api/etherscan';
import LastSeen from './LastSeen';

export default class BlockExplorer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            walletAddress: "",
            validAddress: true,
            validationDone: false,
            blockNumber: 0,
            isLoading: false,
            dataLoaded: false,
            data: []
        };
    }

    setIsLoading(value) {
        this.setState({ isLoading: value })
    }

    setDataLoaded(value) {
        this.setState({
            dataLoaded: value
        });
    }

    setData(data) {
        this.setState({
            data: data
        });
    }

    getTransactions = async (e) => {
        e.preventDefault();
        let validAddress = web3.utils.isAddress(this.state.walletAddress)

        this.setState({
            validAddress: validAddress,
            validationDone: true
        });

        if (validAddress) {
            let addressblock = this.state.walletAddress + '+' + this.state.blockNumber
            if (localStorage.getItem(addressblock)) {
                this.setData(JSON.parse(localStorage.getItem(addressblock)));
                this.setDataLoaded(true);
            } else {
                this.setIsLoading(true);
                await etherscan
                    .get(`&module=account&action=txlist&address=${this.state.walletAddress}&startblock=${this.state.blockNumber}&endblock=99999999&sort=desc`)
                    .then((response) => {
                        this.setData(response.data.result);
                        //localStorage.setItem(addressblock, JSON.stringify(response.data.result));
                        this.setDataLoaded(true);
                        this.setIsLoading(false);
                    }).catch((e) => {
                        console.error(e);
                        this.setIsLoading(false);
                    });
            }
        }
    }

    setWalletAddress(walletAddress) {
        this.setState({
            walletAddress: walletAddress,
            validationDone: false
        });
    }

    setBlockNumber(blockNumber) {
        this.setState({
            blockNumber: blockNumber,
            validationDone: false
        });
    }

    rowSpan(data, formattedData) {
        return <span rel="tooltip" data-toggle="tooltip" data-placement="top" data-original-title={data}>{formattedData ? formattedData : data}</span>
    }

    generateTable(data) {

        let tableRows = [];

        for (const i in data) {
            let totalGas = data[i].gasPrice * data[i].gasUsed;
            let timeStampDate = new Date(data[i].timeStamp * 1000);
            tableRows.push(<tr key={data[i].hash}>
                <td className="ellipsis col hash">{this.rowSpan(data[i].hash)}</td>
                <td className="ellipsis col input">{data[i].input}</td>
                <td className="ellipsis col blockNumber">{data[i].blockNumber}</td>
                <td className="ellipsis col timeStamp">{LastSeen({ date: timeStampDate.getTime() })}</td>
                <td className="ellipsis col from">{data[i].from}</td>
                <td className="ellipsis col to">{data[i].to}</td>
                <td className="ellipsis col value">{web3.utils.fromWei(data[i].value)}</td>
                <td className="ellipsis col fee">{web3.utils.fromWei(totalGas.toString())}</td>
            </tr>)
        }

        if (tableRows) {
            tableRows = <tbody>{tableRows}</tbody>
        }

        return (<div>
            <br />
            <Table striped bordered hover variant="light">
                <thead>
                    <tr>
                        <th>Txn #</th>
                        <th>Method</th>
                        <th>Block</th>
                        <th>Age</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Value</th>
                        <th>Txn Fee</th>
                    </tr>
                </thead>
                {tableRows}
            </Table>
        </div>);
    }

    render() {
        return (
            <Container className="h-100">
                <Row className="align-items-center">
                    <div className="col-3" ></div>
                    <Form className="col-6" >
                        <h1 className="text-center">Get Transactions</h1>
                        <FormGroup controlId="walletaddress">
                            <br />
                            <FormLabel>Wallet Address</FormLabel>
                            <FormControl
                                isValid={this.state.validationDone && this.state.validAddress}
                                isInvalid={this.state.validationDone && !this.state.validAddress}
                                required
                                type="text"
                                placeholder="Wallet Address"
                                onChange={(e) => { this.setWalletAddress(e.target.value) }} />
                            <br />
                        </FormGroup>
                        <FormGroup controlId="blocknumber">
                            <FormLabel>Block Number</FormLabel>
                            <FormControl
                                type="number"
                                min="0"
                                placeholder="Block Number"
                                onChange={(e) => { this.setBlockNumber(e.target.value) }} />
                            <br />
                            {!this.state.isLoading && <FormControl type="submit" className="btn btn-primary" value="Submit" onClick={(e) => this.getTransactions(e)} />}
                            {this.state.isLoading && <Spinner animation="border text-center" ></Spinner>}
                        </FormGroup>
                    </Form>
                    <div className="col-3" ></div>
                </Row>
                {this.state.dataLoaded &&
                                this.generateTable(this.state.data)
                            }
            </Container>
        )
    }
}
