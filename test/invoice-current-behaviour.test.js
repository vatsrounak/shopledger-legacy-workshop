'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var invoice = require('../lib/invoice');
var pricing = require('../lib/pricing');

test('invoice total and GST breakdown match the amounts used when the customer is billed', function () {
  var items = [{
    id: 1,
    sku: 'GRN-001',
    name: 'Rice',
    hsn: '1006',
    price: 1000,
    qty: 1
  }];
  var orderTotals = pricing.computeTotals(items, 'SAVE10');
  var invoiceFigures = invoice.computeInvoiceFigures({
    coupon: 'SAVE10',
    items: items,
    total: orderTotals.total
  });

  assert.deepEqual({
    subtotal: invoiceFigures.subtotal,
    discount: invoiceFigures.discount,
    tax: invoiceFigures.tax,
    cgst: invoiceFigures.cgst,
    sgst: invoiceFigures.sgst,
    total: invoiceFigures.total,
    gstPercent: invoiceFigures.rows[0].gstPercent,
    lineTax: invoiceFigures.rows[0].lineTax
  }, {
    subtotal: orderTotals.subtotal,
    discount: orderTotals.discount,
    tax: orderTotals.tax,
    cgst: orderTotals.cgst,
    sgst: orderTotals.sgst,
    total: orderTotals.total,
    gstPercent: orderTotals.lines[0].gstPercent,
    lineTax: orderTotals.lines[0].tax
  });
});

test('invoice applies the same configured coupon discount cap as order pricing', function () {
  var items = [{
    id: 2,
    name: 'Bulk rice',
    hsn: '1006',
    price: 3000,
    qty: 1
  }];

  var orderTotals = pricing.computeTotals(items, 'SAVE10');
  var invoiceFigures = invoice.computeInvoiceFigures({
    coupon: 'SAVE10',
    items: items,
    total: orderTotals.total
  });

  assert.equal(orderTotals.discount, 150);
  assert.equal(invoiceFigures.discount, orderTotals.discount);
  assert.equal(invoiceFigures.total, orderTotals.total);
});
