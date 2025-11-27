// import { useState } from "react";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { useAuthStore } from "@/stores/auth-store";
// import { useNavigate } from "react-router-dom";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { IconAlertCircle, IconLoader, IconMail, IconArrowLeft } from "@tabler/icons-react";
// import { Card, CardContent } from "@/components/ui/card";

// export function ForgotPasswordForm({
//   className,
//   ...props
// }: React.ComponentProps<"div">) {
//   const [email, setEmail] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string>("");
//   const [success, setSuccess] = useState<boolean>(false);

//   const resetPassword = useAuthStore((state) => state.resetPassword);
//   const navigate = useNavigate();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     const { error } = await resetPassword(email);

//     if (error) {
//       setError(error);
//     } else {
//       setSuccess(true);
//     }

//     setLoading(false);
//   };

//   const handleBackToLogin = () => {
//     navigate("/login");
//   };

//   if (success) {
//     return (
//       <Card className={cn("w-full backdrop-blur-sm", className)} {...props}>
//         <CardContent className="p-6">
//           <div className="flex flex-col gap-6">
//         <div className="flex flex-col gap-6">
//           <div className="flex flex-col items-center gap-2">
//             <div className="flex flex-col items-center gap-2 font-medium">
//               <img
//                 src="/assets/logos/vantage-logo-white.png"
//                 alt="Vantage Logo"
//                 className="hidden dark:block"
//                 width={96}
//                 height={96}
//               />
//               <img
//                 src="/assets/logos/vantage-logo.svg"
//                 alt="Vantage Logo"
//                 className="block dark:hidden"
//                 width={96}
//                 height={96}
//               />
//               <span className="sr-only">Vantage</span>
//             </div>
//             <h1 className="text-xl font-bold">Check your email</h1>
//             <p className="text-sm text-muted-foreground text-center text-balance">
//               We&apos;ve sent a password reset link to your email address.
//             </p>
//           </div>

//           <div className="flex flex-col gap-4">
//             <div className="flex items-center justify-center p-4 rounded-lg bg-muted">
//               <IconMail className="h-8 w-8 text-muted-foreground" />
//             </div>
            
//             <p className="text-sm text-muted-foreground text-center">
//               Please check your email and click the link to reset your password.
//               The link will expire in 24 hours.
//             </p>

//             <Button
//               variant="outline"
//               className="w-full"
//               onClick={handleBackToLogin}
//             >
//               <IconArrowLeft className="mr-2 h-4 w-4" />
//               Back to Login
//             </Button>
//           </div>
//           </div>

//           <div className="text-muted-foreground text-center text-xs text-balance">
//             <span className="[&_a]:hover:text-primary [&_a]:underline [&_a]:underline-offset-4">
//               Didn&apos;t receive the email? Check your spam folder or{" "}
//               <button
//                 onClick={() => setSuccess(false)}
//                 className="hover:text-primary underline underline-offset-4"
//               >
//                 try again
//               </button>
//               .
//             </span>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//     );
//   }

//   return (
//     <Card className={cn("w-full backdrop-blur-sm", className)} {...props}>
//       <CardContent className="p-6">
//       <div className="flex flex-col gap-6">
//         <div className="flex flex-col items-center gap-2">
//           <div className="flex flex-col items-center gap-2 font-medium">
//             <img
//               src="/assets/logos/vantage-logo-white.png"
//               alt="Vantage Logo"
//               className="hidden dark:block"
//               width={96}
//               height={96}
//             />
//             <img
//               src="/assets/logos/vantage-logo.svg"
//               alt="Vantage Logo"
//               className="block dark:hidden"
//               width={96}
//               height={96}
//             />
//             <span className="sr-only">Vantage</span>
//           </div>
//           <h1 className="text-xl font-bold">Forgot your password?</h1>
//           <p className="text-sm text-muted-foreground text-center text-balance">
//             No worries! Enter your email address and we&apos;ll send you a link to reset your password.
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="flex flex-col gap-6">
//           <div className="grid gap-3">
//             <Label htmlFor="email">Email</Label>
//             <Input
//               id="email"
//               type="email"
//               placeholder="m@example.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>

//           {error && (
//             <Alert variant="destructive">
//               <IconAlertCircle className="h-4 w-4" />
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}

//           <Button type="submit" className="w-full" disabled={loading}>
//             {loading && <IconLoader className="mr-2 h-4 w-4 animate-spin" />}
//             {loading ? "Sending..." : "Send Reset Link"}
//           </Button>

//           <div className="flex justify-center">
//             <Button
//               type="button"
//               variant="link"
//               className="text-sm text-muted-foreground hover:text-primary p-0 h-auto"
//               onClick={handleBackToLogin}
//             >
//               <IconArrowLeft className="mr-2 h-4 w-4" />
//               Back to Login
//             </Button>
//           </div>
//         </form>
//         </div>

//         <div className="text-muted-foreground text-center text-xs text-balance">
//           <span className="[&_a]:hover:text-primary [&_a]:underline [&_a]:underline-offset-4">
//             Remember your password?{" "}
//             <button
//               onClick={handleBackToLogin}
//               className="hover:text-primary underline underline-offset-4"
//             >
//               Sign in
//             </button>
//           </span>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

