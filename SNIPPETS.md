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

const DataGridCustomToolbar = ({ searchInput, setSearchInput, setSearch }) => {
  return (
    <GridToolbarContainer>
      <FlexBetween width="100%">
        <FlexBetween>
          <GridToolbarColumnsButton />
          <GridToolbarDensitySelector />
          <GridToolbarExport />
        </FlexBetween>
        <TextField
          label="Search..."
          sx={{ mb: "0.5rem", width: "15rem" }}
          onChange={(e) => setSearchInput(e.target.value)}
          value={searchInput}
          variant="standard"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    setSearch(searchInput);
                    setSearchInput("");
                  }}
                >
                  <Search />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </FlexBetween>
    </GridToolbarContainer>
  );
```

##### renderCell to render custom cells in the Data Grid

```js
 {
      field: "phoneNumber",
      headerName: "Phone Number",
      flex: 0.5,
      renderCell: (params) => {
        return params.value.replace(/^(\d{3})(\d{3})(\d{4})/, "($1)$2-$3");
      },
    },

      {
      field: "products",
      headerName: "# of products",
      flex: 0.5,
      sortable: false,
      renderCell: (params) => params.value.length,
    },

    {
      field: "cost",
      headerName: "Cost",
      flex: 1,
      renderCell: (params) => `$${Number(params.value).toFixed(2)}`,
    },
```

##### To override a material ui css

```js
"& .MuiDataGrid-footerContainer": {
            backgroundColor: theme.palette.background.alt,
            color: theme.palette.secondary[100],
            borderTop: "none",
          },
```

##### To override the default CSS of material ui in case of same selector

```js
 "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${theme.palette.secondary[200]} !important`,
          },
```

##### Sending only the first element of the array to the frontend

```js
 try {
    const overallStat = await OverallStat.find();
    res.status(200).json(overallStat[0]);
  }
```

##### To disable eslint for a particular line

```js
 return [[totalSalesLine], [totalUnitsLine]];
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps
```

##### MongoDB aggregation

```js
const userWithStats = await User.aggregate([
  { $match: { _id: new mongoose.Types.ObjectId(id) } },
  {
    $lookup: {
      from: "affiliatestats",
      localField: "_id",
      foreignField: "userId",
      as: "affiliateStats",
    },
  },
  {
    $unwind: "$affiliateStats",
  },
]);
```

Here's an explanation of the code step by step:

1. `const userWithStats = await User.aggregate([...]);`

   - This line initializes a constant variable called `userWithStats` and assigns it the result of the aggregation operation performed on the `User` collection. The `await` keyword is used because the operation is asynchronous.

2. `{ $match: { _id: new mongoose.Types.ObjectId(id) } },`

   - This is the first stage of the aggregation pipeline. It uses the `$match` operator to filter documents in the `User` collection based on the `_id` field. The value of `_id` is passed as `id` variable, which is converted to a MongoDB ObjectId using `new mongoose.Types.ObjectId(id)`.

3. ```js
   {
     $lookup: {
       from: "affiliatestats",
       localField: "_id",
       foreignField: "userId",
       as: "affiliateStats",
     },
   },
   ```

   - This stage uses the `$lookup` operator to perform a left outer join between the `User` collection and the `affiliatestats` collection. It retrieves documents from the `affiliatestats` collection that have a `userId` field matching the `_id` of the current document in the `User` collection.
   - The `localField` option specifies the field in the `User` collection to match (`_id` in this case).
   - The `foreignField` option specifies the field in the `affiliatestats` collection to match (`userId` in this case).
   - The `as` option specifies the name of the array field where the joined documents will be stored (`affiliateStats` in this case).

4. `{ $unwind: "$affiliateStats" },`
   - This stage uses the `$unwind` operator to deconstruct the `affiliateStats` array field created in the previous stage. It creates a new document for each element in the array, effectively flattening it.

After the execution of the code, the `userWithStats` variable will contain the result of the aggregation operation. It will be an array of documents, where each document represents a joined record from the `User` and `affiliatestats` collections, with the additional `affiliateStats` field that holds the joined document from the `affiliatestats` collection.

##### To modify scrollbar styles

```css
::-webkit-scrollbar {
  width: 10px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #7a7f9d;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #ffffff;
}

/* Handle on hover */
::-webkit-scrollbar-track:hover {
  background: #7a7f9d;
}
```
