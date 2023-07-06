##### Usage of Reduce Function to find how many users are from each country

```js
const users = await User.find();

const mappedLocations = users.reduce((acc, { country }) => {
  const countryIso3 = getCountryIso3(country);
  if (!acc[countryIso3]) {
    acc[countryIso3] = 0;
  }
  acc[countryIso3] += 1;
  return acc;
}, {});

const formattedLocations = Object.entries(mappedLocations).map(
  ([country, count]) => {
    return { id: country, value: count };
  }
);

res.status(200).json(formattedLocations);
```

##### Using Promise.All to fetch data from multiple endpoints i.e. products and their stats

```js
const products = await Product.find();

const productsWithStats = await Promise.all(
  products.map(async (product) => {
    const stat = await ProductStat.find({ product: product._id });
    return { ...product._doc, stat };
  })
);

res.status(200).json(productsWithStats);
```

##### Implementing server side search and sort

```js
//sort should look like this: { "field": "userId", "sort": "asc" }
const { page = 1, pageSize = 20, sort = null, search = "" } = req.query;

// formatted sort should look like {userId : 1}
const generateSort = () => {
  const sortParsed = JSON.parse(sort);
  const sortFormatted = {
    [sortParsed.field]: sortParsed.sort === "asc" ? 1 : -1,
  };
  return sortFormatted;
};
const sortFormatted = Boolean(sort) ? generateSort() : {};

const transactions = await Transaction.find({
  $or: [
    { userId: { $regex: new RegExp(search, "i") } },
    { cost: { $regex: new RegExp(search, "i") } },
  ],
})
  .sort(sortFormatted)
  .skip(page * pageSize)
  .limit(pageSize);

const total = await Transaction.countDocuments({
  name: { $regex: search, $options: "i" },
});

res.status(200).json({ transactions, total });
```

##### Making sure password is not returned in the response

```js
const customers = await User.find({ role: "user" }).select("-password");
res.status(200).json(customers);
```

##### Fetching users on the basis of the id's provided in the request

```js
const { id } = req.params;
const user = await User.findById(id);
res.status(200).json(user);
```

##### Creating Model and saving it to the database

```js
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      min: 2,
      max: 100,
    },
    email: {
      type: String,
      required: true,
      min: 2,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 5,
    },
    city: String,
    state: String,
    country: String,
    occupation: String,
    phoneNumber: String,
    transactions: Array,
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "admin",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;
```

##### Creating routes using express router

```js
import express from "express";
import {
  getProducts,
  getCustomers,
  getTransactions,
  getGeography,
} from "../controllers/client.js";

const router = express.Router();

router.get("/products", getProducts);
router.get("/customers", getCustomers);
router.get("/transactions", getTransactions);
router.get("/geography", getGeography);

export default router;
```

##### Creating controllers for the routes

```js
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
```

##### To insert data in Mongoose in main index.js file

```js
const PORT = process.env.PORT || 9000;
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

    // data seeding - ONE TIME ONLY
    User.insertMany(dataUser);
  })
  .catch((error) => console.log(`${error} did not connect`));
```

##### creating a .env file to store environment variables

```js
MONGO_URL =
  "mongodb+srv://ankitasharmaas311:ankitasharma@cluster0.p67oquh.mongodb.net/?retryWrites=true&w=majority";
PORT = 5001;
```

##### Adding basic routes to the server in main index.js file

```js
app.use("/client", clientRoutes);
app.use("/general", generalRoutes);
app.use("/management", managementRoutes);
app.use("/sales", salesRoutes);
```

##### To create a simple Data Grid

```js
<DataGrid
  loading={isLoading}
  getRowId={(row) => row._id}
  rows={data || []}
  columns={columns}
/>
```

##### To create server side Data Grid

```js
<DataGrid
  loading={isLoading}
  getRowId={(row) => row._id}
  rows={data?.transactions || []}
  columns={columns}
  rowCount={data?.total || 0}
  rowsPerPageOptions={[20, 50, 100]}
  pagination
  page={page}
  pageSize={pageSize}
  paginationMode="server"
  sortingMode="server"
  onPageChange={(newPage) => setPage(newPage)}
  onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
  onSortModelChange={(newSort) => setSort(...newSort)}
  components={{ Toolbar: DataGridCustomToolbar }}
  componentsProps={{
    toolbar: { searchInput, setSearchInput, setSearch },
  }}
/>
```

##### To create a custom toolbar for the Data Grid

```js
toolbar: {
  searchInput, setSearchInput, setSearch;
}
```
