import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PasscodeSetupProps {
  onComplete: (passcode: string) => void;
  onSkip?: () => void;
  onCancel?: () => void;
  title?: string;
  showSkip?: boolean;
}

export function PasscodeSetup({ 
  onComplete, 
  onSkip, 
  onCancel,
  title = "Setup Passcode",
  showSkip = false 
}: PasscodeSetupProps) {
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [error, setError] = useState('');

  const handleDigitClick = (digit: string) => {
    if (step === 'enter') {
      if (passcode.length < 6) {
        setPasscode(passcode + digit);
        if (passcode.length === 5) {
          // Move to confirm after entering 6th digit
          setTimeout(() => {
            setStep('confirm');
          }, 200);
        }
      }
    } else {
      if (confirmPasscode.length < 6) {
        const newConfirm = confirmPasscode + digit;
        setConfirmPasscode(newConfirm);
        
        // Check if complete and matches
        if (newConfirm.length === 6) {
          if (newConfirm === passcode) {
            setTimeout(() => {
              onComplete(passcode);
            }, 200);
          } else {
            setError('Passcodes do not match');
            setTimeout(() => {
              setConfirmPasscode('');
              setError('');
            }, 1000);
          }
        }
      }
    }
  };

  const handleBackspace = () => {
    if (step === 'enter') {
      setPasscode(passcode.slice(0, -1));
    } else {
      setConfirmPasscode(confirmPasscode.slice(0, -1));
    }
  };

  const handleReset = () => {
    setStep('enter');
    setPasscode('');
    setConfirmPasscode('');
    setError('');
  };

  const currentValue = step === 'enter' ? passcode : confirmPasscode;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-[32px] p-8 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          {(onCancel || onSkip) && (
            <button
              onClick={onCancel || onSkip}
              className="text-gray-400 hover:text-white transition-colors"
              data-testid="button-close-passcode"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="text-center mb-8">
          <Lock className="w-16 h-16 mx-auto mb-4 text-purple-500" />
          <p className="text-gray-400 mb-2">
            {step === 'enter' ? 'Create a 6-digit passcode' : 'Confirm your passcode'}
          </p>
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
        <div className="flex justify-center gap-3 mb-8">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <motion.div
              key={index}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                currentValue.length > index
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-gray-700'
              }`}
              animate={{
                scale: currentValue.length === index ? 1.1 : 1,
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              {currentValue.length > index && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-3 h-3 rounded-full bg-purple-500"
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigitClick(digit.toString())}
              className="h-16 bg-gray-800/50 hover:bg-gray-700/50 text-white text-2xl font-semibold rounded-[20px] transition-colors"
              data-testid={`button-digit-${digit}`}
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleReset}
            className="h-16 bg-gray-800/50 hover:bg-gray-700/50 text-white text-sm rounded-[20px] transition-colors"
            data-testid="button-reset"
          >
            Reset
          </button>
          <button
            onClick={() => handleDigitClick('0')}
            className="h-16 bg-gray-800/50 hover:bg-gray-700/50 text-white text-2xl font-semibold rounded-[20px] transition-colors"
            data-testid="button-digit-0"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="h-16 bg-gray-800/50 hover:bg-gray-700/50 text-white text-sm rounded-[20px] transition-colors"
            data-testid="button-backspace"
          >
            ⌫
          </button>
        </div>

        {showSkip && step === 'enter' && (
          <Button
            onClick={onSkip}
            variant="ghost"
            className="w-full text-gray-400"
            data-testid="button-setup-later"
          >
            Setup Later
          </Button>
        )}
      </motion.div>
    </div>
  );
}
