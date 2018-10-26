import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { analytics, helpers } from "additional";
import History from "components/history";
import BalanceWithMeasure from "components/common/balance-with-measure";
import { filterTypes, filterOperations } from "modules/filter";
import { appOperations } from "modules/app";
import Ellipsis from "components/common/ellipsis";

const compare = (a, b) => !a ? -1 : !b ? 1 : a > b ? 1 : a < b ? -1 : 0;

class RegularHistory extends Component {
    getHistoryHeader = () => ([
        {
            Header: <span className="sortable">Name of payment</span>,
            accessor: "name",
            sortMethod: (a, b) => compare(
                a.props.children.toLowerCase(),
                b.props.children.toLowerCase(),
            ),
            width: 235,
        },
        {
            Header: <span className="sortable">Amount</span>,
            accessor: "amount",
            sortMethod: (a, b) => compare(
                a.props.satoshi,
                b.props.satoshi,
            ),
            width: 190,
        },
        {
            Header: <span className="sortable">To</span>,
            accessor: "to",
            sortMethod: (a, b) => compare(
                a.props.children.props.children.toLowerCase(),
                b.props.children.props.children.toLowerCase(),
            ),
            width: 400,
        },
        {
            Header: <span className="sortable">Date</span>,
            accessor: "date",
            sortMethod: (a, b) => compare(
                a.props.dateTime,
                b.props.dateTime,
            ),
            width: 115,
        },
    ]);

    getHistoryData = () => {
        const {
            dispatch, contacts, history, lightningID, filter,
        } = this.props;
        return history
            .filter(item => item.type !== "stream")
            .map((item) => {
                let tempAddress = null;
                contacts.forEach((contact) => {
                    if (contact.lightningID === item.lightningID) {
                        tempAddress = contact.name;
                    }
                });
                tempAddress = tempAddress || (item.lightningID !== lightningID ? item.lightningID : "me");
                const date = new Date(parseInt(item.date, 10));
                const [ymd, hms] = helpers.formatDate(date).split(" ");
                return {
                    ...item,
                    date,
                    hms,
                    tempAddress,
                    ymd,
                };
            })
            .filter(item => dispatch(filterOperations.filter(
                filter,
                {
                    date: item.date,
                    price: item.amount,
                    search: [
                        item.name,
                        item.tempAddress,
                    ],
                    type: item.amount,
                },
            )))
            .map((item, key) => {
                const address = (
                    <span
                        onClick={() => {
                            if (item.lightningID !== "-") {
                                if (helpers.hasSelection()) return;
                                analytics.event({
                                    action: "History address",
                                    category: "Lightning",
                                    label: "Copy",
                                });
                                dispatch(appOperations.copyToClipboard(item.lightningID));
                            }
                        }}
                        title={item.tempAddress}
                    >
                        {item.tempAddress}
                    </span>
                );
                return {
                    amount: <BalanceWithMeasure satoshi={item.amount} />,
                    date: (
                        <div dateTime={item.date}>
                            <span className="date__ymd">{item.ymd}</span>
                            <span className="date__hms">{item.hms}</span>
                        </div>
                    ),
                    name: <Ellipsis classList="history">{item.name}</Ellipsis>,
                    to: <Ellipsis>{address}</Ellipsis>,
                };
            });
    };

    render() {
        return (
            <History
                columns={this.getHistoryHeader()}
                data={this.getHistoryData()}
                defaultSorted={[
                    {
                        desc: true,
                        id: "date",
                    },
                ]}
                source={filterTypes.FILTER_REGULAR}
                title="Regular payments history"
                filters={filterTypes.FILTER_KIND_LIST}
                emptyPlaceholder="No payments found"
            />
        );
    }
}

RegularHistory.propTypes = {
    contacts: PropTypes.arrayOf(PropTypes.shape({
        lightningID: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
    })),
    dispatch: PropTypes.func.isRequired,
    filter: PropTypes.shape().isRequired,
    history: PropTypes.arrayOf(PropTypes.shape).isRequired,
    lightningID: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
    contacts: state.contacts.contacts,
    filter: state.filter.regular,
    history: state.lightning.history,
    lightningID: state.account.lightningID,
});

export default connect(mapStateToProps)(RegularHistory);
