import os
from options.test_options import TestOptions
from data import create_dataset
from models import create_model
from models.test_model import TestModel
from util.visualizer import save_images
from util import html, util
import torch
from PIL import Image


def __patch_instance_norm_state_dict(self, state_dict, module, keys, i=0):
    """Fix InstanceNorm checkpoints incompatibility (prior to 0.4)"""
    key = keys[i]
    if i + 1 == len(keys):  # at the end, pointing to a parameter/buffer
        if module.__class__.__name__.startswith('InstanceNorm') and \
                (key == 'running_mean' or key == 'running_var'):
            if getattr(module, key) is None:
                state_dict.pop('.'.join(keys))
        if module.__class__.__name__.startswith('InstanceNorm') and \
                (key == 'num_batches_tracked'):
            state_dict.pop('.'.join(keys))
    else:
        self.__patch_instance_norm_state_dict(state_dict, getattr(module, key), keys, i + 1)


def load_networks(epoch, model):
    """Load all the networks from the disk.

    Parameters:
        epoch (int) -- current epoch; used in the file name '%s_net_%s.pth' % (epoch, name)
    """
    for name in model.model_names:
        if isinstance(name, str):
            load_filename = '%s_net_%s.pth' % (epoch, name)
            load_path = os.path.join(model.save_dir, load_filename)
            net = getattr(model, 'net' + name)
            if isinstance(net, torch.nn.DataParallel):
                net = net.module
            print('loading the model from %s' % load_path)
            # if you are using PyTorch newer than 0.4 (e.g., built from
            # GitHub source), you can remove str() on self.device
            state_dict = torch.load(load_path, map_location=str(torch.device('cuda:{}'.format(0))))
            if hasattr(state_dict, '_metadata'):
                del state_dict._metadata

            # patch InstanceNorm checkpoints prior to 0.4
            for key in list(state_dict.keys()):  # need to copy keys here because we mutate in loop
                __patch_instance_norm_state_dict(state_dict, net, key.split('.'))
            net.load_state_dict(state_dict)


def print_networks(self, verbose):
    """Print the total number of parameters in the network and (if verbose) network architecture

    Parameters:
        verbose (bool) -- if verbose: print the network architecture
    """
    print('---------- Networks initialized -------------')
    for name in self.model_names:
        if isinstance(name, str):
            net = getattr(self, 'net' + name)
            num_params = 0
            for param in net.parameters():
                num_params += param.numel()
            if verbose:
                print(net)
            print('[Network %s] Total number of parameters : %.3f M' % (name, num_params / 1e6))
    print('-----------------------------------------------')


def illustrate(img, opt):
    # get test options

    torch.cuda.set_device(opt.gpu_ids[0])
    model = TestModel(opt)
    model.setup(opt)
    # hard-code some parameters for test
    opt.num_threads = 0  # test code only supports num_threads = 1
    opt.batch_size = 1  # test code only supports batch_size = 1
    opt.serial_batches = True  # disable data shuffling; comment this line if results on randomly chosen images are needed.
    opt.no_flip = True  # no flip; comment this line if results on flipped images are needed.
    opt.display_id = -1  # no visdom display; the test code saves the results to a HTML file.
    im = Image.fromarray(img, mode='RGB')

    model.set_input(im)
    model.forward()
    gen = util.tensor2im(model.fake)

    return gen


