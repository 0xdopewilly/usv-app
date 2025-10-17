import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, X } from 'lucide-react';

interface PasscodeEntryProps {
  onSuccess: (passcode: string) => void;
  onCancel?: () => void;
  title?: string;
  subtitle?: string;
  onVerify: (passcode: string) => Promise<boolean>;
}

export function PasscodeEntry({ 
  onSuccess, 
  onCancel,
  title = "Enter Passcode",
  subtitle = "Enter your 6-digit passcode",
  onVerify
}: PasscodeEntryProps) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleDigitClick = async (digit: string) => {
    if (passcode.length < 6) {
      const newPasscode = passcode + digit;
      setPasscode(newPasscode);
      
      // Auto-verify when 6 digits are entered
      if (newPasscode.length === 6) {
        setIsVerifying(true);
        try {
          const isValid = await onVerify(newPasscode);
          if (isValid) {
            onSuccess(newPasscode);
          } else {
            setError('Incorrect passcode');
            setTimeout(() => {
              setPasscode('');
              setError('');
            }, 1000);
          }
        } catch (err) {
          setError('Verification failed');
          setTimeout(() => {
            setPasscode('');
            setError('');
          }, 1000);
        } finally {
          setIsVerifying(false);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPasscode(passcode.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-[32px] p-6 w-full max-w-md my-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-white transition-colors"
              data-testid="button-close-passcode-entry"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="text-center mb-6">
          <Lock className="w-12 h-12 mx-auto mb-3 text-purple-500" />
          <p className="text-gray-400 text-sm mb-2">{subtitle}</p>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm"
            >
              {error}
            </motion.p>
          )}
        </div>

        {/* Passcode Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <motion.div
              key={index}
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                passcode.length > index
                  ? error 
                    ? 'border-red-500 bg-red-500/20'
                    : 'border-purple-500 bg-purple-500/20'
                  : 'border-gray-700'
              }`}
              animate={{
                scale: passcode.length === index ? 1.1 : 1,
                rotate: error ? [0, -10, 10, -10, 10, 0] : 0,
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              {passcode.length > index && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`w-2.5 h-2.5 rounded-full ${error ? 'bg-red-500' : 'bg-purple-500'}`}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigitClick(digit.toString())}
              disabled={isVerifying}
              className="h-14 bg-gray-800/50 hover:bg-gray-700/50 text-white text-xl font-semibold rounded-[20px] transition-colors disabled:opacity-50"
              data-testid={`button-entry-digit-${digit}`}
            >
              {digit}
            </button>
          ))}
          <div className="h-14" />
          <button
            onClick={() => handleDigitClick('0')}
            disabled={isVerifying}
            className="h-14 bg-gray-800/50 hover:bg-gray-700/50 text-white text-xl font-semibold rounded-[20px] transition-colors disabled:opacity-50"
            data-testid="button-entry-digit-0"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            disabled={isVerifying}
            className="h-14 bg-gray-800/50 hover:bg-gray-700/50 text-white text-sm rounded-[20px] transition-colors disabled:opacity-50"
            data-testid="button-entry-backspace"
          >
            ⌫
          </button>
        </div>
      </motion.div>
    </div>
  );
}
