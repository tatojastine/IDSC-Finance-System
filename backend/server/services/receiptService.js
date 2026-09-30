const receipts = require("../data/receipts");

function getReceiptById(id) {
  return receipts.find(
    (receipt) => receipt.receiptNumber === id
  );
}

module.exports = {
  getReceiptById
};