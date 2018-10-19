import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import ReactTable from "react-table";
import { filterTypes } from "modules/filter";
import { HISTORY_ROWS_PER_PAGE } from "config/consts";
import Filter from "components/filter";
import Pagination from "./pagination";

class History extends Component {
    constructor(props) {
        super(props);
        this.state = {
            page: 0,
        };
    }

    onPageChange = (page) => {
        this.setState({ page });
    };

    render() {
        const {
            withoutTitle, title, emptyPlaceholder, source, ...table
        } = this.props;
        const renderEmptyList = () => (
            <div className="placeholder_text">
                {emptyPlaceholder || "Here all your transactions will be displayed"}
            </div>
        );
        const renderData = () => (
            <Fragment>
                <Filter
                    source={source}
                />
                <ReactTable
                    {...table}
                    page={this.state.page}
                    resizable={false}
                    showPageSizeOptions={false}
                    defaultPageSize={HISTORY_ROWS_PER_PAGE}
                    PaginationComponent={Pagination}
                    customPagination={this.onPageChange}
                />
            </Fragment>
        );
        const renderTitle = () => {
            if (withoutTitle) {
                return null;
            }
            return [
                <div className="history__title" key={0}>
                    {title || "History"}
                </div>,
            ];
        };

        return (
            <div className="history">
                {renderTitle()}
                {!this.props.data.length ? renderEmptyList() : renderData()}
            </div>
        );
    }
}

History.propTypes = {
    columns: PropTypes.arrayOf(PropTypes.shape({
        Header: PropTypes.any,
        accessor: PropTypes.any,
    })).isRequired,
    data: PropTypes.arrayOf(PropTypes.shape().isRequired).isRequired,
    dispatch: PropTypes.func.isRequired,
    emptyPlaceholder: PropTypes.string,
    source: PropTypes.oneOf([
        filterTypes.TYPE_REGULAR,
        filterTypes.TYPE_RECURRING,
        filterTypes.TYPE_ONCHAIN,
    ]),
    title: PropTypes.string,
    withoutTitle: PropTypes.bool,
};

export default connect()(History);
