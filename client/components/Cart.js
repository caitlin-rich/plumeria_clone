////IMPORTS////

import React, { useState } from "react";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import {
  removeItemFromCart,
  fetchUpdateFlower,
} from "../store/cart";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { Box, Button, Typography } from "@material-ui/core";
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import { me } from "../store";

////STYLING////

const StyledTableCell = withStyles(theme => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableRow = withStyles(theme => ({
  root: {
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

////COMPONENT////

function Cart({flowers, cart, updateItem, removeItem}) {

  console.log(cart)

  const [selectedQuantity, setSelectedQuantity] = useState([1]);

  function handleChange(e) {
    setSelectedQuantity(e.target.value);
  }

  function handleSubmitQuantity(e, token, orderDetailId, quant) {
    e.preventDefault();
    updateItem(token, orderDetailId, quant);
  }

  //BUG FIX: 11/29/21 we have a new and exciting DELETE error. Now the cart is showing it doesn't exist (aka cart.id is returning False) after we hit the delete icon. It shows up correctly after refreshing though!
  function handleSubmitDelete(e, token, orderDetailId) {
    e.preventDefault();
    removeItem(token, orderDetailId);
  }

  return (
    <Box m={50}>
      <div>
        <TableContainer component={Paper}>
          <Table aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell></StyledTableCell>
                <StyledTableCell align="center">Flower Name</StyledTableCell>
                <StyledTableCell align="center">Quantity</StyledTableCell>
                <StyledTableCell align="center">Price</StyledTableCell>
                <StyledTableCell align="center">Edit</StyledTableCell>
                <StyledTableCell align="center">Remove Item</StyledTableCell>
              </TableRow>
            </TableHead>

            {cart.id
              ? cart.OrderDetails.map(detail => {
                  let flower = flowers.filter(
                    flower => flower.id === detail.flowerId
                  );
                  let quantity = detail.quantity;
                  let orderDetail = detail.id;

                  //quantityArr and renderQuant deal with the Update Quantity dropdown:
                  let quantityArr = [];
                  for (let i = 1; i <= flower.map(i => i.quantity); i++) {
                    quantityArr.push(i);
                  }

                //  let quantityArr = flower.map(i => i.quantity)
                 //can we make this immutable? likely yes!

                  let renderQuant = quantityArr.map(num => (
                    <option value={num}>{num}</option>
                  ));

                  //getting total 
                  //Plan: loop through, using similar code to the quantityArr loop, and then add up total that way. can probably use .reduce?

                  return (

                    <TableBody>
                      {flower.map(info => (
                        
                        
                        <StyledTableRow key={info.name}>
                          <StyledTableCell component="th" scope="row">
                            <Link to={`/flowers/${info.id}`}><img className="orderImage" src={info.image} /></Link>
                          </StyledTableCell>

                          <StyledTableCell align="center">
                          <Link to={`/flowers/${info.id}`}>{info.name}</Link>
                          </StyledTableCell>

                          <StyledTableCell align="center">
                            {quantity}
                          </StyledTableCell>

                          <StyledTableCell align="center">
                            ${((info.price * quantity)/ 100).toFixed(2)} @ $
                            {(info.price / 100)} per unit
                          </StyledTableCell>

                          <StyledTableCell align="center">
                            <div>
                              <select
                                key={detail.id}
                                name="selectedQuantity"
                                value={selectedQuantity}
                                onChange={e => handleChange(e)}
                              >
                                {renderQuant}
                              </select>
                              <Button
                                onClick={(
                                  e,
                                  token = window.localStorage.token,
                                  orderDetailId = detail.id,
                                  quant = selectedQuantity
                                ) =>
                                  handleSubmitQuantity(
                                    e,
                                    token,
                                    orderDetailId,
                                    quant
                                  )
                                }
                              >
                                Update Quantity
                              </Button>
                            </div>
                          </StyledTableCell>

                          <StyledTableCell align="center">
                            <Button
                              onClick={(
                                e,
                                token = window.localStorage.token,
                                orderDetailId = orderDetail
                              ) => handleSubmitDelete(e, token, orderDetailId)}
                            >
                              <DeleteForeverIcon />
                            </Button>
                          </StyledTableCell>

                        </StyledTableRow>
                      ))}
                    </TableBody>
                  );
                })
              : "Cart Cannot Be Found."}
          </Table>
        </TableContainer>
        <Typography>Total Placeholder: $0.00</Typography>
        <Button href="/payment">Checkout</Button>
      </div>
    </Box>
  );
}

const mapState = state => {
  return {
    cart: state.cart,
    flowers: state.flowers,
  };
};

const mapDispatch = dispatch => {
  return {

    loadInitialData() {
      dispatch(me());
    },
    removeItem: (token, orderDetailId) => {
      dispatch(removeItemFromCart(token, orderDetailId));
    },
    updateItem: (token, orderDetail, quantity) => {
      dispatch(fetchUpdateFlower(token, orderDetail, quantity));
    },
  };
};

export default withRouter(connect(mapState, mapDispatch)(Cart));
