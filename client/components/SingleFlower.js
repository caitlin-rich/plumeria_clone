import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { fetchSingleFlower } from "../store/singleFlower";
import { me } from "../store";
import {
  fetchCart,
  fetchAddCart,
  fetchAddToOrder,
  fetchUpdateFlower,
} from "../store/cart";

import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { Box } from "@material-ui/core";

const styles = theme => ({
  root: {
    minWidth: 275,
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)",
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  media: {
    height: 140,
  },
});

function SingleFlower(props) {
  const [selectedQuantity, setSelectedQuantity] = useState(0);
  const [addedToCartMessage, setAddedToCartMessage] = useState("");
  const [loaded, setLoaded] = useState(false)

  const {
    isLoggedIn,
    flower,
    cart,
    getFlower,
    getCart,
    addCart,
    updateFlowerQuantity,
    addToOrder,
    match,
  } = props;

  const token = window.localStorage.token;
  const flowerId = parseInt(match.params.id);

  //BUG FIX: this had been on componentDidMount, but now that this is function the useEffect hook SHOULD in theory be doing the same thing, but i am definitely getting this running continuously. it's not impeding actual function, but it still shouldn't be happening.

    useEffect(() => {
      if (loaded === false){
        getFlower(flowerId)
        setLoaded(true) 
      }
    });
    
  

  const { name, image, price, description, quantity } = flower;

  //uses a for loop to put 1 through total quantity into quantity selection dropdown
  let quantityArr = [];
  for (let i = 0; i <= quantity; i++) {
    quantityArr.push(i);
  }
  let renderQuant = quantityArr.map(num => <option key={num}>{num}</option>);

  function handleChange(event) {
    setSelectedQuantity(event.target.value);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (isLoggedIn) {
      if (selectedQuantity === 0) {
        setAddedToCartMessage("Please choose a quantity.");
        return;
      }

      //uses flowerId to determine if flower is already in cart
      if (cart) {
        const orderDetail = cart.OrderDetails.filter(
          element => (element.flowerId = flowerId)
        );

        //BUG FIX: it seems like new flowers aren't adding correctly
        console.log(orderDetail)
        //BUG FIX: if already in cart, new total should be current order quantity + selected quantity and need to set it up so we can't add more flowers than we have in stock
        if (orderDetail.length > 0) {
          updateFlowerQuantity(token, orderDetail[0].id, selectedQuantity);
          setAddedToCartMessage("Flower(s) added to cart!");
        } else {
          addToOrder(token, cart.id, flowerId, selectedQuantity);
          setAddedToCartMessage("Flower(s) added to cart!");
        }
      } else {
        addCart(token, flowerId, selectedQuantity);
      }
    } else {
      ////GUEST CART////;
      setAddedToCartMessage("");
      //do i need this setAddedToCart here?
      const cartInLocalStorage = localStorage.getItem("cart");
      const items = (() => {
        return cartInLocalStorage === null
          ? []
          : JSON.parse(cartInLocalStorage);
      })();
      const addItems = (() => {
        if (selectedQuantity === 0) {
          this.setState({
            addedToCartMessage: "Please select a quantity to add.",
          });
          return;
        }
        for (let i = 0; i < items.length; i++) {
          let existingId = items[i].id;
          if (existingId === flowerId) {
            let pastQuantity = items[i].quantity;
            if (
              parseInt(quantity) >
              parseInt(flower.quantity) - parseInt(pastQuantity)
            ) {
              setAddedToCartMessage(
                `Low Stock: Please add ${
                  parseInt(flower.quantity) - parseInt(pastQuantity)
                } or fewer.`
              );

              return;
            }
            items.splice(i, 1);
            items.push({
              id: flowerId,
              image: image,
              name: name,
              price: price,
              quantity: parseInt(quantity) + parseInt(pastQuantity),
              totalStock: parseInt(flower.quantity),
            });
            setAddedToCartMessage("Flower quantity updated!");
            return;
          }
        }
        items.push({
          id: flowerId,
          image: image,
          name: name,
          price: price,
          quantity: quantity,
          totalStock: parseInt(flower.quantity),
        });
        setAddedToCartMessage("Flower(s) added to cart!");
      })();
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }

  return (
    <Box m={50} justify="center" alignItems="center">
      <Card className={styles.title}>
        <Button>{name}</Button>
        <CardMedia component="img" height="400" image={image} title={name} />
        <Typography>${price / 100}</Typography>
        <h3>{description}</h3>
        <div id="quantitySelect">
          Quantity:
          <select
            name="selectedQuantity"
            value={selectedQuantity}
            onChange={e => handleChange(e)}
          >
            {renderQuant}
          </select>
        </div>
        <Button onClick={e => handleSubmit(e)}>Add To Cart</Button>
        <Typography>{addedToCartMessage}</Typography>
      </Card>
    </Box>
  );
}

const mapState = state => {
  return {
    auth: state.auth,
    isLoggedIn: !!state.auth.id,
    flower: state.flower,
    cart: state.cart, //cart
  };
};
const mapDispatch = dispatch => {
  return {
    getMe: () => {
      dispatch(me());
    },
    getFlower: id => {
      dispatch(fetchSingleFlower(id));
    },
    getCart: token => {
      dispatch(fetchCart(token));
    },
    addCart: (token, flowerId, quantity) => {
      dispatch(fetchAddCart(token, flowerId, quantity));
    },
    addToOrder: (token, orderId, flowerId, quantity) => {
      dispatch(fetchAddToOrder(token, orderId, flowerId, quantity));
    },
    updateFlowerQuantity: (token, orderDetail, quantity) => {
      dispatch(fetchUpdateFlower(token, orderDetail, quantity));
    },
  };
};
export default withRouter(connect(mapState, mapDispatch)(SingleFlower));
