"""
Order Management API endpoints.
Implements business logic: stock validation, auto-deduction, total calculation.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import Customer, Order, OrderItem, Product
from ..schemas import OrderCreate, OrderItemResponse, OrderResponse

router = APIRouter(prefix="/orders", tags=["Orders"])


def _serialize_order(order: Order) -> dict:
    """Convert an Order ORM object to a response dict with nested names."""
    return {
        "id": order.id,
        "customer_id": order.customer_id,
        "customer_name": order.customer.full_name if order.customer else None,
        "total_amount": order.total_amount,
        "status": order.status,
        "created_at": order.created_at,
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "product_name": item.product.name if item.product else None,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "subtotal": item.subtotal,
            }
            for item in order.items
        ],
    }


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    """
    Create a new order.
    - Validates customer exists
    - Validates each product exists and has sufficient stock
    - Deducts stock from products
    - Auto-calculates total_amount
    """
    # Validate customer
    customer = (
        db.query(Customer).filter(Customer.id == order_data.customer_id).first()
    )
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {order_data.customer_id} not found.",
        )

    # Validate products and check stock
    order_items = []
    total_amount = 0.0

    for item in order_data.items:
        product = (
            db.query(Product).filter(Product.id == item.product_id).first()
        )
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {item.product_id} not found.",
            )
        if product.quantity_in_stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Insufficient stock for product '{product.name}'. "
                    f"Available: {product.quantity_in_stock}, "
                    f"Requested: {item.quantity}."
                ),
            )

        subtotal = round(product.price * item.quantity, 2)
        total_amount += subtotal

        order_items.append(
            OrderItem(
                product_id=product.id,
                quantity=item.quantity,
                unit_price=product.price,
                subtotal=subtotal,
            )
        )

        # Deduct stock
        product.quantity_in_stock -= item.quantity

    # Create order
    db_order = Order(
        customer_id=order_data.customer_id,
        total_amount=round(total_amount, 2),
        status="completed",
        items=order_items,
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    # Re-query with joins for response
    db_order = (
        db.query(Order)
        .options(
            joinedload(Order.customer),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .filter(Order.id == db_order.id)
        .first()
    )

    return _serialize_order(db_order)


@router.get("/", response_model=list[OrderResponse])
def get_orders(db: Session = Depends(get_db)):
    """Retrieve all orders with customer names and item details."""
    orders = (
        db.query(Order)
        .options(
            joinedload(Order.customer),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .order_by(Order.id.desc())
        .all()
    )
    return [_serialize_order(o) for o in orders]


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Retrieve order details by ID."""
    order = (
        db.query(Order)
        .options(
            joinedload(Order.customer),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {order_id} not found.",
        )
    return _serialize_order(order)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    """
    Cancel/Delete an order.
    Restores stock for each item in the order.
    """
    order = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {order_id} not found.",
        )

    # Restore stock
    for item in order.items:
        product = (
            db.query(Product).filter(Product.id == item.product_id).first()
        )
        if product:
            product.quantity_in_stock += item.quantity

    db.delete(order)
    db.commit()
    return None
