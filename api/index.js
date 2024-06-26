const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

var app = express();
const port = 8000;
var cors = require('cors');
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');

  next();
});
app.use(cors({ origin: true, credentials: true }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const jwt = require('jsonwebtoken');
app.listen(port, () => {
  console.log("Server is running on port " + port);
});

mongoose
  .connect("mongodb+srv://TaiNguyen:Tai@cluster0.gm8lsik.mongodb.net/", {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");

  })
  .catch((err) => {
    console.log("Error connecting to MongoDb", err);
  });

const User = require("./models/user");
const Order = require("./models/order");
const Product = require("./models/Product")
const Ticket = require("./models/Ticket");
const Admin = require("./models/admin");
const bcrypt = require('bcryptjs');





app.post('/changepassword', async (req, res) => {
  const { Email, password, confirmPassword } = req.body;

  try {
    // Kiểm tra xác nhận mật khẩu
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Mật khẩu xác nhận không khớp' });
    }

    // Tìm người dùng theo email
    const user = await User.findOne({ Email });

    if (!user) {
      return res.status(404).json({ error: 'Người dùng không tồn tại' });
    }

    // Cập nhật mật khẩu mới cho người dùng
    user.password = password;
    await user.save();

    return res.status(200).json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Đã xảy ra lỗi khi đổi mật khẩu' });
  }
});







// Route to handle forgot password request
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const newPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = newPassword;
    await user.save();
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'Tainguyenlq.0123@gmail.com',
        pass: 'fucc zyds hruu qvta',
      },
    });

    const mailOptions = {
      from: 'Tainguyenlq.0123@gmail.com',
      to: email,
      subject: 'Password Reset',
      text: `Your new password is: ${newPassword}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: 'Failed to send email' });
      } else {
        console.log('Email sent: ' + info.response);
        return res.status(200).json({ message: 'New password sent to your email' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});




app.get('/Tickets', async (req, res) => {
  try {
    const Tickets = await Ticket.find();
    res.json(Tickets);
  } catch (error) {
    console.error('Error fetching productssssss:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});
app.get('/Products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error('Error fetching productssssss:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

//Add Ticket
app.post("/AddTicket", async (req, res) => {
  console.log("Tai")
  try {
    const {ticket_Name, Price, Note} = req.body;
    const NewTicket = new Ticket({ ticket_Name, Price, Note});
    await NewTicket.save();
    console.log("Tai")
    console.log("Thêm vé thành công", NewTicket);
    res.status(201).json({
      message:
        "Thành công",
    });
  } catch (error) {
    console.log("Lỗi khi thêm vé:", error);
    res.status(500).json({ message: "Thêm vé thất bại" });
  }
});

app.post("/AddProduct", async (req, res) => {
  console.log("Tai")
  try {
    const { product_Name, product_image, product_information} = req.body;
    const NewProduct = new Product({ product_Name, product_image, product_information});
    await NewProduct.save();
    console.log("Tai")
    console.log("Thêm tin tức thành công", NewProduct);
    res.status(201).json({
      message:
        "Thành công",
    });
  } catch (error) {
    console.log("Lỗi khi thêm tin tức:", error);
    res.status(500).json({ message: "Thêm tin tức thất bại" });
  }
});


app.get('/users', async (req, res) => {
  try {
    const user = await User.find();
    res.json(user);
  } catch (error) {
    console.error('Error fetching productssssss:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    console.error('Error fetching productssssss:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("Email already registered:", email);
      return res.status(400).json({ message: "Email already registered" });
    }
    const newUser = new User({ name, email, password });
    
    // Generate and store the verification token

    await newUser.save();
    console.log("New User Registered:", newUser);
    
    res.status(201).json({
      message:
        "Registration successful. Please check your email for verification.",
    });
  } catch (error) {
    console.log("Error during registration:", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

//endpoint to verify the email
app.get("/verify/:token", async (req, res) => {
  try {
    const token = req.params.token;

    //Find the user witht the given verification token
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(404).json({ message: "Invalid verification token" });
    }

    //Mark the user as verified
    user.verified = true;
    user.verificationToken = undefined;

    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Email Verificatioion Failed" });
  }
});

const generateSecretKey = () => {
  const secretKey = crypto.randomBytes(32).toString("hex");

  return secretKey;
};

const secretKey = generateSecretKey();

//endpoint to login the user!

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    //check if the user exists
    const user = await User.findOne({ email });
    loggedInUserEmail = email;
    if (!user) {
      return res.status(401).json({ message: "Tên người dùng không tồn tại" });
    }

    //check if the password is correct
    if (user.password !== password) {
      return res.status(401).json({ message: "Mật khẩu không đúng" });
    }
    
    //generate a token
    const token = jwt.sign({ userId: user._id }, secretKey);

    res.status(200).json({ token });
    
  } catch (error) {
    res.status(500).json({ message: "Login Failed" });
  }
});

//endpoint to store a new address to the backend
app.post("/addresses", async (req, res) => {
  try {
    const { userId, address } = req.body;

    //find the user by the Userid
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //add the new address to the user's addresses array
    user.addresses.push(address);

    //save the updated user in te backend
    await user.save();

    res.status(200).json({ message: "Address created Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error addding address" });
  }
});

//endpoint to get all the addresses of a particular user
app.get("/addresses/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const addresses = user.addresses;
    res.status(200).json({ addresses });
  } catch (error) {
    res.status(500).json({ message: "Error retrieveing the addresses" });
  }
});
// app.get("/mail/:userId", async (req, res) => {
//   try {
//     const userId = req.params.userId;

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const mail = user.email;
//     res.status(200).json({ mail });
//   } catch (error) {
//     res.status(500).json({ message: "Error retrieveing the mail" });
//   }
// });

//endpoint to store all the orders
app.post("/orders", async (req, res) => {
  try {
    const { OrderID, userId, cartItems, totalPrice, Mail, DateTime, paymentMethod } =
      req.body;

    const newCode = Math.random().toString(36).slice(-8);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //create an array of product objects from the cart Items
    const products = cartItems.map((item) => ({
      ticket_Name: item?.ticket_Name,
      quantity: item.quantity,
      Price: item.Price,
      Note: item?.Note,
      Ticker_Code: newCode,
    }));

    //create a new Order
    const order = new Order({
      user: userId,
      cartItems: products,
      totalPrice: totalPrice,
      // shippingAddress: shippingAddress,
      Mail:Mail,
      DateTime:DateTime,
      paymentMethod: paymentMethod,
    });

    await order.save();

    res.status(200).json({ message: "Order created successfully!" });

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'Tainguyenlq.0123@gmail.com',
        pass: 'fucc zyds hruu qvta',
      },
    });

    const mailOptions = {
      from: 'Tainguyenlq.0123@gmail.com',
      to: Mail,
      subject: 'Book a museum visit',
      text: `Your booking code is: ${newCode} Visit the museum at: ${DateTime}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: 'Failed to send email' });
      } else {
        console.log('Email sent: ' + info.response);
        return res.status(200).json({ message: 'booking code sent to your email' });
      }
    });
  } catch (error) {
    console.log("error creating orders", error);
    res.status(500).json({ message: "Error creating orders" });
  }
});

//get the user profile
app.get("/profile/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving the user profile" });
  }
});

app.get("/orders/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const orders = await Order.find({ user: userId }).populate("user");

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" })
    }

    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
});

app.delete('/users/:userId/addresses/:addressId', async (req, res) => {
  const userId = req.params.userId;
  const addressId = req.params.addressId;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { addresses: { _id: addressId } } },
      { new: true }
    );

    if (user) {
      res.json({ success: true, message: 'Address deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting address' });
  }
});
