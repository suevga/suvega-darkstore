import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button'
import { Input } from '../ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useSignUp } from '@clerk/clerk-react';
import { useToast } from '../../hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function RegistrationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { signUp, isLoaded, setActive } = useSignUp();
  const { toast } = useToast();
  const navigate = useNavigate();
  // Initialize form with react-hook-form and zod resolver
  const form = useForm({
    defaultValues: {
      storeName: "",
      email: "",
      password: ""
    }
  });

  async function onSubmit(values) {
    if (!isLoaded) return;
    setIsLoading(true);
    try {
      // Start the sign-up process
      const signUpAttempt = await signUp.create({
        username: values.storeName,
        emailAddress: values.email,
        password: values.password,
      });

      // Prepare OTP verification
      await signUpAttempt.prepareEmailAddressVerification({
        strategy: "email_code"
      });

      // Update state to show OTP input
      setOtpSent(true);
      
      toast({
        title: "OTP Sent",
        description: "A verification code has been sent to your email."
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Registration Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function verifyOTP(otpCode) {
    if (!isLoaded) return;

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: otpCode
      });
      console.log("completeSignUp::" + JSON.stringify(completeSignUp));
      
      if (completeSignUp.status) {
        await setActive({session: completeSignUp.createdSessionId})
        toast({
          title: "Registration Successful",
          description: "Your account has been created!"
        });
        // Redirect or further actions after successful registration
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: "OTP Verification Failed",
        description: "Invalid or expired verification code.",
        variant: "destructive"
      });
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-200 shadow-lg">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold mb-4">Register Your DarkStore</CardTitle>
        </CardHeader>
        <CardContent>
          {!otpSent ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="storeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your store name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-between items-center">
                <h4>
                  Already have an account?
                </h4>
                <Button
                  type="button"
                  variant="link"
                  className="px-0"
                  onClick={() => navigate('/login')}
                >
                  Sign in
                </Button>
              </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
              <Input 
                placeholder="Enter OTP" 
                maxLength={6}
                onChange={(e) => {
                  const otpCode = e.target.value;
                  if (otpCode.length === 6) {
                    verifyOTP(otpCode);
                  }
                }}
              />
              <p className="text-sm text-muted-foreground">
                Please check your email for the 6-digit verification code
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}