<?php
include 'db.php';

?>
<!DOCTYPE html>
<html>

<head>
    <title>Products List</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>

<body class="bg-light">
    <div class="container py-5">
        <h1 class="mb-4">Products</h1>
        <a href="create.php" class="btn btn-primary mb-3">Add Product</a>
        <table class="table table-bordered table-hover bg-white">
            <thead class="table-dark">
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php
                $stmt = $pdo->query("SELECT * FROM products");
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {

                    echo "<tr>
                    <td>{$row['id']}</td>
                    <td>{$row['name']}</td>
                    <td>\${$row['price']}</td>
                    <td>
                        <a href='edit.php?id={$row['id']}' class='btn btn-sm btn-warning'>Edit</a>
                        <a href='delete.php?id={$row['id']}' class='btn btn-sm btn-danger' onclick='return confirm(\"Are you sure?\")'>Delete</a>
                    </td>
                  </tr>";
                }
                ?>
            </tbody>
        </table>
    </div>
</body>

</html>