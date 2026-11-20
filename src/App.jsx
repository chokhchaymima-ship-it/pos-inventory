import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Badge, IconButton, Button,
  Card, CardMedia, CardContent, CardActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Switch, TextField, Snackbar, Alert, LinearProgress,
  Box, Container, Grid, Chip, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, Tooltip, Stack
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PrintIcon from '@mui/icons-material/Print';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';

// Initial mock product data (Clean Thai names)
const initialProducts = [
  {
    id: 1,
    name: 'กาแฟอาราบิกาคั่วสด',
    category: 'เครื่องดื่ม',
    price: 65,
    stock: 15,
    initialStock: 20,
    isAvailable: true,
    image: './images/coffee.jpg'
  },
  {
    id: 2,
    name: 'ชาเขียวมัทฉะพรีเมียม',
    category: 'เครื่องดื่ม',
    price: 70,
    stock: 4, // Low stock (< 5)
    initialStock: 20,
    isAvailable: true,
    image: './images/matcha.jpg'
  },
  {
    id: 3,
    name: 'ครัวซองต์เนยสดฝรั่งเศส',
    category: 'เบเกอรี่',
    price: 55,
    stock: 8,
    initialStock: 15,
    isAvailable: true,
    image: './images/croissant.jpg'
  },
  {
    id: 4,
    name: 'เค้กช็อกโกแลตฟัดจ์',
    category: 'เบเกอรี่',
    price: 85,
    stock: 3, // Low stock (< 5)
    initialStock: 15,
    isAvailable: true,
    image: './images/cake.jpg'
  },
  {
    id: 5,
    name: 'น้ำส้มยูซุสปาร์คกลิ้ง',
    category: 'เครื่องดื่ม',
    price: 60,
    stock: 12,
    initialStock: 20,
    isAvailable: true,
    image: './images/yuzu.jpg'
  },
  {
    id: 6,
    name: 'แซนด์วิชแฮมชีสโทสต์',
    category: 'อาหารว่าง',
    price: 45,
    stock: 2, // Low stock (< 5)
    initialStock: 12,
    isAvailable: true,
    image: './images/sandwich.jpg'
  },
  {
    id: 7,
    name: 'คุกกี้ข้าวโอ๊ตช็อกโกแลตชิพ',
    category: 'เบเกอรี่',
    price: 40,
    stock: 10,
    initialStock: 20,
    isAvailable: true,
    image: './images/cookie.jpg'
  },
  {
    id: 8,
    name: 'ชานมไต้หวันพ่นไฟ',
    category: 'เครื่องดื่ม',
    price: 65,
    stock: 6,
    initialStock: 18,
    isAvailable: true,
    image: './images/boba-milktea.jpg?v=2'
  }
];

// Valid discount voucher list
const DISCOUNT_CODES = {
  'DISCOUNT10': { type: 'percent', value: 10, label: 'ลด 10%' },
  'DISCOUNT20': { type: 'percent', value: 20, label: 'ลด 20%' },
  'SAVE50': { type: 'fixed', value: 50, label: 'ลด 50 บาท' }
};

export default function App() {
  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState([]);
  const [discountInput, setDiscountInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [cashReceived, setCashReceived] = useState('');

  // Feedback Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Receipt modal dialog state
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Status Control: Toggle Product Sale availability immediately (Switch)
  const handleToggleStatus = (id) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const nextStatus = !p.isAvailable;
        setSnackbar({
          open: true,
          message: `${p.name} ${nextStatus ? 'เปิดการจำหน่ายแล้ว' : 'ปิดการจำหน่ายแล้ว'}`,
          severity: nextStatus ? 'info' : 'warning'
        });
        return { ...p, isAvailable: nextStatus };
      }
      return p;
    }));
  };

  // Add product to cart
  const handleAddToCart = (product) => {
    if (!product.isAvailable) {
      setSnackbar({
        open: true,
        message: 'สินค้านี้ปิดการจำหน่ายอยู่ ไม่สามารถเพิ่มลงตะกร้าได้',
        severity: 'error'
      });
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;

    if (currentQtyInCart >= product.stock) {
      setSnackbar({
        open: true,
        message: `ไม่สามารถเพิ่มได้ สต็อกคงเหลือมีเพียง ${product.stock} ชิ้น`,
        severity: 'error'
      });
      return;
    }

    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }

    // Feedback: Snackbar when item added to cart successfully
    setSnackbar({
      open: true,
      message: `เพิ่ม "${product.name}" ลงในตะกร้าสำเร็จ`,
      severity: 'success'
    });
  };

  // Update quantity in cart (IconButton: เพิ่ม/ลด/ลบ รายการสินค้า)
  const handleUpdateCartQuantity = (id, delta) => {
    const cartItem = cart.find(item => item.id === id);
    const product = products.find(p => p.id === id);

    if (!cartItem) return;

    const newQty = cartItem.quantity + delta;
    if (newQty <= 0) {
      handleRemoveFromCart(id);
      return;
    }

    if (newQty > product.stock) {
      setSnackbar({
        open: true,
        message: `สินค้าในคลังมีเพียง ${product.stock} ชิ้น`,
        severity: 'warning'
      });
      return;
    }

    setCart(cart.map(item => item.id === id ? { ...item, quantity: newQty } : item));
  };

  // Remove item completely from cart
  const handleRemoveFromCart = (id) => {
    const itemToRemove = cart.find(item => item.id === id);
    setCart(cart.filter(item => item.id !== id));
    if (itemToRemove) {
      setSnackbar({
        open: true,
        message: `ลบ "${itemToRemove.name}" ออกจากตะกร้าแล้ว`,
        severity: 'info'
      });
    }
  };

  // Clear cart
  const handleClearCart = () => {
    setCart([]);
    setAppliedDiscount(null);
    setDiscountInput('');
    setCashReceived('');
  };

  // Apply Discount Code
  const handleApplyDiscount = () => {
    const code = discountInput.trim().toUpperCase();
    if (!code) {
      setAppliedDiscount(null);
      return;
    }

    if (DISCOUNT_CODES[code]) {
      setAppliedDiscount({ code, ...DISCOUNT_CODES[code] });
      setSnackbar({
        open: true,
        message: `ใช้โค้ดส่วนลด "${code}" (${DISCOUNT_CODES[code].label}) สำเร็จ`,
        severity: 'success'
      });
    } else {
      setSnackbar({
        open: true,
        message: 'โค้ดส่วนลดไม่ถูกต้อง (ลองใช้: DISCOUNT10, DISCOUNT20, SAVE50)',
        severity: 'error'
      });
    }
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let discountAmount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.type === 'percent') {
      discountAmount = (subtotal * appliedDiscount.value) / 100;
    } else if (appliedDiscount.type === 'fixed') {
      discountAmount = Math.min(subtotal, appliedDiscount.value);
    }
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  // VAT 7%
  const vatAmount = taxableAmount * 0.07;
  const grandTotal = taxableAmount + vatAmount;

  const cashNum = parseFloat(cashReceived) || 0;
  const changeAmount = cashNum >= grandTotal ? cashNum - grandTotal : 0;
  const isPaymentSufficient = cashNum >= grandTotal && grandTotal > 0;

  // Handle Checkout & Real-time Inventory Deduction
  const handleCheckout = () => {
    if (cart.length === 0) {
      setSnackbar({
        open: true,
        message: 'กรุณาเลือกสินค้าลงตะกร้าก่อนชำระเงิน',
        severity: 'warning'
      });
      return;
    }

    if (!isPaymentSufficient) {
      setSnackbar({
        open: true,
        message: `ยอดเงินที่รับ (฿${cashNum.toFixed(2)}) น้อยกว่าราคาสุทธิ (฿${grandTotal.toFixed(2)})`,
        severity: 'error'
      });
      return;
    }

    // Verify stock availability
    for (const item of cart) {
      const prod = products.find(p => p.id === item.id);
      if (prod.stock < item.quantity) {
        setSnackbar({
          open: true,
          message: `สินค้า "${item.name}" มีสต็อกไม่เพียงพอ (เหลือ ${prod.stock} ชิ้น)`,
          severity: 'error'
        });
        return;
      }
    }

    // Deduct stock in real-time
    setProducts(prev => prev.map(p => {
      const cartItem = cart.find(item => item.id === p.id);
      if (cartItem) {
        return {
          ...p,
          stock: p.stock - cartItem.quantity
        };
      }
      return p;
    }));

    // Record completed order for receipt
    const orderData = {
      orderNo: 'POS-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleString('th-TH'),
      items: [...cart],
      subtotal,
      discountAmount,
      appliedDiscount,
      vatAmount,
      grandTotal,
      cashReceived: cashNum,
      changeAmount
    };

    setCompletedOrder(orderData);
    setReceiptOpen(true);
    handleClearCart();

    setSnackbar({
      open: true,
      message: 'ทำรายการและตัดสต็อกเรียบร้อยแล้ว!',
      severity: 'success'
    });
  };

  const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f4f6f8' }}>

      {/* Navigation & Header */}
      <AppBar position="sticky" sx={{ bgcolor: '#0f172a', boxShadow: 3 }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}
              >
                <PointOfSaleIcon />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, letterSpacing: -0.5 }}>
                  ระบบบริหารจัดการคำสั่งซื้อและคลังสินค้าหน้าร้าน
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  ระบบคิดเงินหน้าร้านและตัดสต็อกสินค้าอัตโนมัติ (งานที่ 2)
                </Typography>
              </Box>
            </Box>

            {/* Badge showing items in cart */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tooltip title="จำนวนสินค้าในตะกร้า">
                <Badge badgeContent={totalItemsInCart} color="error" max={99}>
                  <IconButton sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.08)' }}>
                    <ShoppingCartIcon />
                  </IconButton>
                </Badge>
              </Tooltip>
              <Chip
                icon={<CheckCircleIcon sx={{ '&&': { color: '#10b981' } }} />}
                label="ระบบออนไลน์ & สต็อกเรียลไทม์"
                size="small"
                sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 600, display: { xs: 'none', md: 'flex' } }}
              />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Layout Container */}
      <Container maxWidth="xl" sx={{ mt: 3, mb: 5, flexGrow: 1 }}>
        <Grid container spacing={3}>

          {/* Left Column: Product Catalog & Inventory Control */}
          <Grid item xs={12} lg={7} xl={8}>
            <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, bgcolor: '#ffffff', border: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    รายการสินค้าในคลังหน้าร้าน
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    แสดงรายการสินค้า สต็อกคงเหลือ และควบคุมการจำหน่าย
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip label={`สินค้าทั้งหมด: ${products.length} รายการ`} size="small" variant="outlined" />
                  <Chip
                    label={`ใกล้หมด (<5): ${products.filter(p => p.stock < 5 && p.stock > 0).length}`}
                    size="small"
                    color="warning"
                  />
                </Box>
              </Box>
            </Paper>

            {/* Data Presentation: Card, CardMedia, CardContent, CardActions */}
            <Grid container spacing={2.5}>
              {products.map((product) => {
                const isLowStock = product.stock < 5 && product.stock > 0;
                const isOutOfStock = product.stock === 0;
                const stockPercentage = Math.min(100, (product.stock / product.initialStock) * 100);

                return (
                  <Grid item xs={12} sm={6} md={4} key={product.id}>
                    <Card
                      elevation={0}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                        border: isLowStock ? '1.5px solid #f59e0b' : '1px solid #e2e8f0',
                        bgcolor: !product.isAvailable ? '#f1f5f9' : '#ffffff',
                        opacity: !product.isAvailable ? 0.75 : 1,
                        transition: 'all 0.2s ease-in-out',
                        position: 'relative',
                        '&:hover': {
                          transform: product.isAvailable ? 'translateY(-3px)' : 'none',
                          boxShadow: product.isAvailable ? '0 10px 20px rgba(0,0,0,0.06)' : 'none'
                        }
                      }}
                    >
                      {/* Stock Alert Badge */}
                      {isLowStock && (
                        <Chip
                          label="⚠️ สินค้าใกล้หมด"
                          size="small"
                          color="warning"
                          sx={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            zIndex: 2,
                            fontWeight: 700,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                          }}
                        />
                      )}
                      {isOutOfStock && (
                        <Chip
                          label="❌ สินค้าหมดสต็อก"
                          size="small"
                          color="error"
                          sx={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            zIndex: 2,
                            fontWeight: 700,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                          }}
                        />
                      )}

                      {/* CardMedia */}
                      <Box sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height="160"
                          image={product.image}
                          alt={product.name}
                          sx={{
                            filter: (!product.isAvailable || isOutOfStock) ? 'grayscale(80%)' : 'none',
                            objectFit: 'cover'
                          }}
                        />
                        <Chip
                          label={product.category}
                          size="small"
                          sx={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            bgcolor: 'rgba(15, 23, 42, 0.75)',
                            color: '#fff',
                            backdropFilter: 'blur(4px)',
                            fontSize: '0.75rem'
                          }}
                        />
                      </Box>

                      {/* CardContent */}
                      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, minHeight: '3rem', lineHeight: 1.3 }}>
                          {product.name}
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mt: 1, mb: 1.5 }}>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: '#2563eb' }}>
                            ฿{product.price.toFixed(2)}
                          </Typography>
                          <Typography variant="body2" sx={{ color: product.stock < 5 ? '#d97706' : '#64748b', fontWeight: 600 }}>
                            คงเหลือ: {product.stock} ชิ้น
                          </Typography>
                        </Box>

                        {/* Feedback: LinearProgress */}
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                              สัดส่วนสต็อก ({product.stock}/{product.initialStock})
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: isLowStock ? '#d97706' : isOutOfStock ? '#dc2626' : '#10b981' }}>
                              {Math.round(stockPercentage)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={stockPercentage}
                            color={isOutOfStock ? "error" : isLowStock ? "warning" : "primary"}
                            sx={{ height: 7, borderRadius: 4, bgcolor: '#e2e8f0' }}
                          />
                        </Box>
                      </CardContent>

                      <Divider />

                      {/* Inputs & Controls: Switch & CardActions */}
                      <CardActions sx={{ p: 1.5, justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Switch
                            size="small"
                            checked={product.isAvailable}
                            onChange={() => handleToggleStatus(product.id)}
                            color="success"
                          />
                          <Typography variant="caption" sx={{ fontWeight: 600, color: product.isAvailable ? '#15803d' : '#94a3b8' }}>
                            {product.isAvailable ? 'เปิดจำหน่าย' : 'ปิดจำหน่าย'}
                          </Typography>
                        </Box>

                        <Button
                          variant="contained"
                          size="small"
                          disabled={!product.isAvailable || isOutOfStock}
                          onClick={() => handleAddToCart(product)}
                          startIcon={<AddShoppingCartIcon sx={{ fontSize: 18 }} />}
                          sx={{
                            textTransform: 'none',
                            borderRadius: 2,
                            fontWeight: 600,
                            bgcolor: '#2563eb',
                            '&:hover': { bgcolor: '#1d4ed8' }
                          }}
                        >
                          เพิ่มลงตะกร้า
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>

          {/* Right Column: Cart Table, Calculation, Discount, Payment & Receipt */}
          <Grid item xs={12} lg={5} xl={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                position: { lg: 'sticky' },
                top: { lg: 88 }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShoppingCartIcon sx={{ color: '#2563eb' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    ตะกร้าสินค้า
                  </Typography>
                </Box>
                {cart.length > 0 && (
                  <Button
                    size="small"
                    color="error"
                    onClick={handleClearCart}
                    startIcon={<DeleteSweepIcon sx={{ fontSize: 16 }} />}
                    sx={{ textTransform: 'none' }}
                  >
                    ล้างตะกร้า
                  </Button>
                )}
              </Box>

              {/* Data Presentation: Table */}
              <TableContainer sx={{ maxHeight: 280, mb: 2, border: '1px solid #f1f5f9', borderRadius: 2 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 700, color: '#475569' }}>สินค้า</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>จำนวน</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>รวม</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cart.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4, color: '#94a3b8' }}>
                          <RemoveShoppingCartIcon sx={{ fontSize: 36, opacity: 0.5, display: 'block', margin: '0 auto 8px' }} />
                          ยังไม่มีสินค้าในตะกร้า
                        </TableCell>
                      </TableRow>
                    ) : (
                      cart.map((item) => (
                        <TableRow key={item.id} hover>
                          <TableCell sx={{ py: 1.2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                              {item.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                              @ ฿{item.price.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ py: 1 }}>
                            {/* Inputs & Controls: IconButton */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <IconButton
                                size="small"
                                onClick={() => handleUpdateCartQuantity(item.id, -1)}
                                color="primary"
                                sx={{ p: 0.5 }}
                              >
                                <RemoveIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                              <Typography variant="body2" sx={{ fontWeight: 700, px: 1, minWidth: 24, textAlign: 'center' }}>
                                {item.quantity}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleUpdateCartQuantity(item.id, 1)}
                                color="primary"
                                sx={{ p: 0.5 }}
                              >
                                <AddIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Box>
                          </TableCell>
                          <TableCell align="right" sx={{ py: 1, fontWeight: 600 }}>
                            ฿{(item.price * item.quantity).toFixed(2)}
                          </TableCell>
                          <TableCell align="center" sx={{ py: 1 }}>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveFromCart(item.id)}
                              sx={{ p: 0.5 }}
                            >
                              <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Inputs & Controls: TextField */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="โค้ดส่วนลด"
                    placeholder="DISCOUNT10 / DISCOUNT20 / SAVE50"
                    value={discountInput}
                    onChange={(e) => setDiscountInput(e.target.value)}
                    variant="outlined"
                  />
                  <Button
                    variant="outlined"
                    onClick={handleApplyDiscount}
                    sx={{ textTransform: 'none', whiteSpace: 'nowrap', fontWeight: 600 }}
                  >
                    ใช้โค้ด
                  </Button>
                </Box>
                {appliedDiscount && (
                  <Chip
                    label={`ใช้โค้ด: ${appliedDiscount.code} (${appliedDiscount.label})`}
                    color="success"
                    size="small"
                    onDelete={() => {
                      setAppliedDiscount(null);
                      setDiscountInput('');
                    }}
                    sx={{ mt: 1, fontWeight: 600 }}
                  />
                )}
                <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5, display: 'block' }}>
                  ทดลองใช้โค้ด: DISCOUNT10 (ลด 10%), DISCOUNT20 (ลด 20%), SAVE50 (ลด 50 บาท)
                </Typography>
              </Box>

              <Divider sx={{ my: 1.5 }} />

              {/* Calculations */}
              <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, mb: 2 }}>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>ราคารวม:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>฿{subtotal.toFixed(2)}</Typography>
                  </Box>
                  {appliedDiscount && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                      <Typography variant="body2">ส่วนลด ({appliedDiscount.label}):</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>-฿{discountAmount.toFixed(2)}</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>ภาษีมูลค่าเพิ่ม (VAT 7%):</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>฿{vatAmount.toFixed(2)}</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>ยอดสุทธิ:</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#2563eb' }}>฿{grandTotal.toFixed(2)}</Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Inputs & Controls: TextField */}
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="จำนวนเงินที่รับ"
                  placeholder="ระบุจำนวนเงินที่ลูกค้าชำระ"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  InputProps={{
                    startAdornment: <span style={{ marginRight: 6, color: '#64748b', fontWeight: 600 }}>฿</span>
                  }}
                  error={cashNum > 0 && cashNum < grandTotal}
                  helperText={
                    cashNum > 0 && cashNum < grandTotal
                      ? `ยอดเงินไม่เพียงพอ (ขาด ฿${(grandTotal - cashNum).toFixed(2)})`
                      : ''
                  }
                />

                {/* Quick Cash Buttons */}
                {grandTotal > 0 && (
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                    {[Math.ceil(grandTotal), 100, 500, 1000].map((amount) => {
                      if (amount < grandTotal && amount !== Math.ceil(grandTotal)) return null;
                      return (
                        <Chip
                          key={amount}
                          label={`฿${amount}`}
                          size="small"
                          onClick={() => setCashReceived(amount.toString())}
                          sx={{ cursor: 'pointer', fontWeight: 600 }}
                        />
                      );
                    })}
                  </Box>
                )}
              </Box>

              {/* Change Calculation */}
              <Box sx={{ p: 1.5, mb: 2.5, borderRadius: 2, bgcolor: isPaymentSufficient ? '#ecfdf5' : '#f8fafc', border: isPaymentSufficient ? '1px solid #6ee7b7' : '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isPaymentSufficient ? '#065f46' : '#64748b' }}>
                    เงินทอน:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: isPaymentSufficient ? '#059669' : '#94a3b8' }}>
                    ฿{changeAmount.toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              {/* Checkout Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                disabled={cart.length === 0 || !isPaymentSufficient}
                onClick={handleCheckout}
                startIcon={<ReceiptLongIcon />}
                sx={{
                  py: 1.4,
                  borderRadius: 2.5,
                  fontWeight: 700,
                  fontSize: '1rem',
                  textTransform: 'none',
                  bgcolor: '#2563eb',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                  '&:hover': { bgcolor: '#1d4ed8' }
                }}
              >
                ชำระเงิน & พิมพ์ใบเสร็จรับเงินย่อ
              </Button>
            </Paper>
          </Grid>

        </Grid>
      </Container>

      {/* Feedback: Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: 2, fontWeight: 600, boxShadow: 3 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Dialog: ใบเสร็จรับเงินย่อ */}
      <Dialog
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <CheckCircleIcon sx={{ fontSize: 44, color: '#10b981', display: 'block', margin: '0 auto 4px' }} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>ใบเสร็จรับเงินย่อ</Typography>
          <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
            ร้านค้าปลีก สาขาหลัก
          </Typography>
        </DialogTitle>

        <DialogContent dividers id="receipt-print-area">
          {completedOrder && (
            <Box>
              <Box sx={{ mb: 2, fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
                <div>เลขที่ใบเสร็จ: <strong>{completedOrder.orderNo}</strong></div>
                <div>วันที่ทำรายการ: {completedOrder.date}</div>
                <div>พนักงาน: แคชเชียร์ 01</div>
              </Box>

              <Divider sx={{ borderStyle: 'dashed', my: 1.5 }} />

              {/* Receipt Table */}
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', pl: 0 }}>รายการ</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>จน.</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.8rem', pr: 0 }}>รวม</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {completedOrder.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ fontSize: '0.8rem', pl: 0, py: 0.8 }}>
                        {item.name}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: '0.8rem', py: 0.8 }}>
                        {item.quantity}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.8rem', pr: 0, py: 0.8 }}>
                        ฿{(item.price * item.quantity).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Divider sx={{ borderStyle: 'dashed', my: 1.5 }} />

              {/* Totals */}
              <Stack spacing={0.6} sx={{ fontSize: '0.85rem' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>ราคารวม:</span>
                  <span>฿{completedOrder.subtotal.toFixed(2)}</span>
                </Box>
                {completedOrder.discountAmount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                    <span>ส่วนลด ({completedOrder.appliedDiscount?.label}):</span>
                    <span>-฿{completedOrder.discountAmount.toFixed(2)}</span>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>ภาษีมูลค่าเพิ่ม (VAT 7%):</span>
                  <span>฿{completedOrder.vatAmount.toFixed(2)}</span>
                </Box>
                <Divider sx={{ my: 0.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                  <span>ยอดสุทธิ:</span>
                  <span>฿{completedOrder.grandTotal.toFixed(2)}</span>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>รับเงินสด:</span>
                  <span>฿{completedOrder.cashReceived.toFixed(2)}</span>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#059669' }}>
                  <span>เงินทอน:</span>
                  <span>฿{completedOrder.changeAmount.toFixed(2)}</span>
                </Box>
              </Stack>

              <Divider sx={{ borderStyle: 'dashed', my: 2 }} />
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#94a3b8' }}>
                *** ขอบคุณที่ใช้บริการ ***<br />
                (ตัดสต็อกสินค้าในระบบเรียลไทม์แล้ว)
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => window.print()}
            startIcon={<PrintIcon />}
            sx={{ textTransform: 'none' }}
          >
            พิมพ์ใบเสร็จ
          </Button>
          <Button
            variant="contained"
            onClick={() => setReceiptOpen(false)}
            sx={{ textTransform: 'none', bgcolor: '#2563eb', fontWeight: 600 }}
          >
            เริ่มรายการใหม่
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
