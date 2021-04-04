from django.shortcuts import render
from rest_framework.response import Response
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from ..order.views import validate_user_session
from ..order.models import Order
from ..order.serializers import OrderSerializer

from ecom.settings import env
import json
import razorpay

@csrf_exempt
def start_payment(request, token, user_id):
    if not validate_user_session(id = user_id, token = token):
        return JsonResponse({'error':'Please re-login', 'code':'1'})

    if not request.method == 'POST':
        return JsonResponse({'error':'Send a post request with valid parameters'})
    else:
        amount = request.POST['amount']
        products = request.POST['products']

        total_pro = len(products.split(','))
        # setup razorpay client
        client = razorpay.Client(auth=(env('PUBLIC_KEY'), env('SECRET_KEY')))

        # create razorpay order
        payment = client.order.create({"amount": int(amount) * 100, 
                                    "currency": "INR", 
                                    "payment_capture": "1"})
        
        UserModel = get_user_model()

        try:
            user = UserModel.objects.get(pk = user_id)
        except UserModel.DoesNotExist:
            return JsonResponse({'error':'User does not exist'})

            # we are saving an order with is_paid=False
        ordr = Order(user = user, product_names = products, total_products= total_pro, total_amount= amount, transaction_id=payment['id'])
        ordr.save()
        # serializer = OrderSerializer(request.user, context={'request': request})
        serializer = OrderSerializer(ordr, context={'request': request})
        
        data = {
            "payment": payment,
            "order": serializer.data
        }
        return JsonResponse(data)

@csrf_exempt
def handle_payment_success(request):
    # request.data is coming from frontend
    res = json.loads(request.POST["response"])

    """res will be:
    {'razorpay_payment_id': 'pay_G3NivgSZLx7I9e', 
    'razorpay_order_id': 'order_G3NhfSWWh5UfjQ', 
    'razorpay_signature': '76b2accbefde6cd2392b5fbf098ebcbd4cb4ef8b78d62aa5cce553b2014993c0'}
    """

    ord_id = ""
    raz_pay_id = ""
    raz_signature = ""

    # res.keys() will give us list of keys in res
    for key in res.keys():
        if key == 'razorpay_order_id':
            ord_id = res[key]
        elif key == 'razorpay_payment_id':
            raz_pay_id = res[key]
        elif key == 'razorpay_signature':
            raz_signature = res[key]

    # get order by payment_id which we've created earlier with isPaid=False
    order = Order.objects.get(transaction_id = ord_id)

    data = {
        'razorpay_order_id': ord_id,
        'razorpay_payment_id': raz_pay_id,
        'razorpay_signature': raz_signature
    }

    client = razorpay.Client(auth=(env('PUBLIC_KEY'), env('SECRET_KEY')))

    # checking if the transaction is valid or not if it is "valid" then check will return None
    check = client.utility.verify_payment_signature(data)

    if check is not None:
        print("Redirect to error url or error page")
        return Response({'error': 'Something went wrong'})

    # if payment is successful that means check is None then we will turn is_paid=True
    order.is_paid = True
    order.save()

    res_data = {
        'message': 'Payment successfully received!'
    }
    return JsonResponse(res_data)